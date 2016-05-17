
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request

import hashlib
import random
from functools import wraps
import types
from concurrent.futures import ThreadPoolExecutor
import passlib.hash  # For passwords
import json
from itertools import chain
import random
import csv
import io
import time
now = lambda: round(time.time()*1000)

from sparrow import *

from model import *
from util import *
from util import sim

# ?
from datetime import datetime



# Helper stuff (decorators, metaclasses)
# ======================================

# Decorator stuff
# ---------------

def require_user_level(level):
    def handler_decorator(method):
        @wraps(method)
        async def handler_wrapper(self, req):
            if req.conn.user is None:
                raise Authentication("not_logged_in", "You need to be logged in", "conn.user is None, can't use type " + method.__name__)
            else:
                # TODO check level
                await method(self, req)
        return handler_wrapper
    return handler_decorator


def handle_ws_type(*types):
    def decorator(method):
        method.__handle_types__ = types
        return method
    return decorator


# Metaclasses
# -----------

class MetaController(type):
    def __new__(self, name, bases, dct):
        dct["wshandlers"] = {}
        # Detects functions marked with handle_ws_type
        for (n,f) in dct.items():
            if hasattr(f, "__handle_types__"):
                for handle_type in f.__handle_types__:
                    dct["wshandlers"][handle_type] = f
        return type.__new__(self, name, bases, dct)


# Actual little helper functions and constants
# --------------------------------------------

from string import ascii_letters, digits
random_chars = ascii_letters + digits

def check_for_type(req: "Request", typ: str):
    if not req.metadata["for"]["what"] == typ:
        raise Error("wrong_object_type", "Wrong object type in for.what")

# Dictionary to limit possible fields on which to filter in 'where' clause
value_props_per_type = {}
for cls in Value, HourValue, DayValue, MonthValue, YearValue:
    value_props = {p.name: p for p in cls._props if p.json}
    value_props_per_type[cls.__name__] = (cls, value_props)

# The Controller
# ==============

class Controller(metaclass=MetaController):
    executor = ThreadPoolExecutor(4)

    # General methods
    # ---------------

    def __init__(self, logger, model, ow):
        self.logger = logger
        self.model = model
        self.ow = ow
        self.sessions = {}
        # Session --> User.key

    async def handle_request(self, req):
        # See metaclass
        # Kind of a switch class too, but I'd like to keep it flat
        if req.metadata["type"] in Controller.wshandlers:
            await Controller.wshandlers[req.metadata["type"]](self, req)
        else:
            self.logger.error("No handler for %s in Controller"%req.metadata["type"])

    async def get_user(self, session):
        if session in self.sessions:
            return await User.find_by_key(self.sessions[session], self.db)
        else:
            return None

    async def conn_close(self, conn):
        pass  # TODO?

    async def insert_csv_file(self, body: bytes):
        """Insert the data in the body (expects bytes as csv)"""
        f = io.StringIO(body.decode("utf-8"))
        reader = csv.reader(f, dialect=sim.elecsim_dialect)
        data = list(reader)

        sensors = []
        for i, name in enumerate(data[0][2:]):
            if name == "":
                continue
            try:
                csv_sensor = sim.CsvSensor(name)
                sensor = await Sensor.find_by_key(csv_sensor.ID, self.db)
                # TODO check_auth
            except Exception as e:
                self.logger.info("Something went wrong while searching for sensor with name {}: {}".format(name, e))
                continue
            sensors.append((i, csv_sensor, sensor))

        times = []
        for row in data[1:]:
            time = int(datetime.strptime(row[0], sim.csv_date_format).timestamp()*1000)
            #print(row[0], "\t", time)
            times.append(time)

        if len(sensors) == 0:
            self.logger.info("No sensors???")

        for (i, csv_sensor, sensor) in sensors:
            values = []
            for j, row in enumerate(data[1:]):
                value = (float(row[i+2]), times[j])
                #print(value)
                values.append(value)

            self.logger.info("Inserting for sensor {}".format(sensor.SID))
            try:
                await sensor.insert_values(values, self.db)
            except SqlError as e:
                self.logger.error("Error in database: {}".format(e))
                self.logger.error("Moving on...")
    
    async def add_live_value(self, SID, secret_key, value):
        s = await Sensor.find_by_key(SID, self.db)
        if s.secret_key != secret_key:
            self.logger.error("Wrong key used")
            raise Error("wrong_key", "wrong_key")
        await Value.add_live_value(SID, value, now(), self.db)
        

    # Will you look at that. Beautiful replacement for a switch statement if I say
    # so myself.
    class switch_what(switch):
        """Base class for switch selecting on "what"."""
        def select(self, req):
            return req.metadata["what"]

        def default(self, req):
            raise Error("unknown_object_type", "Object type '{}' not recognized".format(req.metadata["what"]))


    # Helper methods
    # --------------

    @property
    def db(self):
        """Shortcut (simple getter)"""
        return self.model.db

    @blocking  # executed on Controller.executor
    def create_password(self, p):
        return passlib.hash.bcrypt.encrypt(p, rounds=13)

    @blocking
    def verify_password(self, hashed, p):
        return passlib.hash.bcrypt.verify(p, hashed)


    # Websocket handlers
    # ------------------

    # TODO take queries out of function and add the to the model so they can be printed

    @handle_ws_type("signup")
    async def handle_signup(self, req):
        c = await User.get(User.email == Unsafe(req.data["email"])).count(self.db)
        if c >= 1:
            self.logger.error("Email %s already taken"%req.data["email"])
            await req.answer({"status": "failure", "reason": "email_taken"})
        else:
            # Manual initialisation because password isn't in json
            hash = await self.create_password(req.data["password"])
            w = Wall(is_user=True)
            await w.insert(self.db)
            u = User(email=req.data["email"], password=hash,
                     first_name=req.data["first_name"], last_name=req.data["last_name"],
                     admin=False,
                     wall=w.key,)
            await u.insert(self.db)
            await req.answer({
                "status": "success",
                "UID": u.UID
            })


    @handle_ws_type("login")
    async def handle_login(self, req):
        res = await User.get(User.email == Unsafe(req.data["email"])).exec(self.db)
        if res.count() == 0:
            await req.answer({"status": "failure", "reason": "email_unknown"})
            return
        u = res.single()

        if (await self.verify_password(u.password, req.data["password"])):
            session = hashlib.md5(bytes(str(random.random())[2:] + "WoordPopNoordzee", "utf8")).hexdigest()
            self.sessions[session] = u.key
            req.conn.user = u
            req.conn.session = session
            await req.answer({"status": "success", "session": session, "user": u.json_repr()})
        else:
            await req.answer({"status": "failure", "reason": "wrong_password"})


    @handle_ws_type("logout")
    @require_user_level(1)
    async def handle_logout(self, req):
        self.sessions.pop(req.conn.session)
        req.conn.session = None
        req.conn.user = None


    @handle_ws_type("add")
    @require_user_level(1)
    class handle_add(switch_what):
        @case("Location")
        async def location(self, req):
            if req.data["user_UID"] == req.conn.user.UID:
                l = Location(json_dict=req.data)
                await l.insert(self.db)
                await req.answer(l.json_repr())
            else:
                raise Authentication("wrong", "You gave a wrong user_UID.")

        @case("Sensor")
        async def sensor(self, req):
            l = await Location.find_by_key(req.data["location_LID"], self.db)
            await l.check_auth(req)
            if req.data["user_UID"] == req.conn.user.UID:
                s = Sensor(json_dict=req.data)
                await s.insert(self.db)
                await req.answer(s.json_repr())
            else:
                raise Authentication("wrong", "You gave a wrong user_UID.")

        @case("Value")
        async def value(self, req):
            check_for_type(req, "Sensor")
            v = Value(sensor=req.metadata["for"]["SID"], time=req.data[0], value=req.data[1])
            # await v.check_auth(req, db=self.db)
            await v.insert(self.db)
            await req.answer(v.json_repr())

        @case("Tag")
        async def tag(self, req):
            check_for_type(req, "Sensor")
            res = await Tag.get(Tag.description == Unsafe(req.data["text"])).exec(self.db)
            # Check if tag with that description attribute is already present in the database
            if res.count() == 0:
                new_tag = Tag(description=req.data["text"])
                await new_tag.insert(self.db)
                tagged = Tagged(sensor=req.metadata["for"]["SID"], tag=new_tag.TID)
                await tagged.insert(self.db)
                await req.answer(new_tag.json_repr())
            else:
                t = res.single()
                tagged = Tagged(sensor=req.metadata["for"]["SID"], tag=t.TID)
                await tagged.insert(self.db)
                await req.answer(t.json_repr())

        @case("Group")
        async def group(self, req):
            g = Group(json_dict=req.data)
            await g.check_auth(req, db=self.db)
            await g.insert(self.db)
            await req.answer(g.json_repr())

        @case("Wall")
        async def wall(self, req):
            w = Wall(is_user=req.data["is_user"])
            await w.check_auth(req, db=self.db)
            await w.insert(self.db)
            await req.answer(w.json_repr())

        @case("Status")
        async def status(self, req):
            s = Status(json_dict=req.data)
            await s.check_auth(req, db=self.db)
            await s.insert(self.db)
            await req.answer(s.json_repr())

        @case("Comment")
        async def comment(self, req):
            c = Comment(json_dict=req.data)
            await c.check_auth(req, db=self.db)
            await c.insert(self.db)
            await req.answer(c.json_repr())

        @case("Like")
        async def like(self, req):
            l = Like(json_dict=req.data)
            await l.check_auth(req, db=self.db)
            await l.insert(self.db)
            await req.answer(l.json_repr())

        @case("Friendship")
        async def friendship(self, req):
            if req.data["user1_UID"] > req.data["user2_UID"]:
                req.data["user1_UID"], req.data["user2_UID"] = req.data["user2_UID"], req.data["user1_UID"]
            if await Friendship.contains(req.data["user1_UID"],req.data["user2_UID"],self.db):
                await req.answer({"status":"failure", "reason":"Friendship already exists."})
            else:
                f = Friendship(json_dict=req.data)
                await f.check_auth(req, db=self.db)
                await f.insert(self.db)
                await req.answer(f.json_repr())

        @case("Membership")
        async def membership(self, req):
            m = Membership(json_dict=req.data)
            await m.check_auth(req, db=self.db)
            await m.insert(self.db)
            await req.answer(m.json_repr())

        @case("Graph")
        async def graph(self, req):
            try:
                g = req.conn.graph_cache[req.data["GID"]]
            except KeyError:
                raise Error("graph_already_saved", "You already saved that graph")
            await g.save(self.db)
            #await g.fill(self.db)
            await req.answer(g.json_repr())
            del req.conn.graph_cache[req.data["GID"]]
        
        @case("LiveGraph")
        async def livegraph(self, req):
            try:
                g = req.conn.live_graph_cache[req.data["LGID"]]
            except KeyError:
                raise Error("graph_already_saved", "You already saved that graph")
            await g.save(self.db)
            #await g.fill(self.db)
            await req.answer(g.json_repr())
            del req.conn.live_graph_cache[req.data["LGID"]]

    @handle_ws_type("get")
    @require_user_level(1)
    class handle_get(switch_what):
        @case("Location")
        async def location(self, req):
            l = await Location.find_by_key(req.data["LID"], self.db)
            await l.check_auth(req)
            await req.answer(l.json_repr())

        @case("Sensor")
        async def sensor(self, req):
            s = await Sensor.find_by_key(req.data["SID"], self.db)
            await s.check_auth(req)
            await req.answer(s.json_repr())

        @case("User")
        async def user(self, req):
            u = await User.find_by_key(req.data["UID"], self.db)
            await u.check_auth(req)
            await req.answer(u.json_repr())

        @case("Graph")
        async def graph(self, req):
            g = await Graph.find_by_key(req.data["GID"], self.db)
            await g.fill(self.db)
            await req.answer(g.json_repr())
        
        @case("LiveGraph")
        async def livegraph(self, req):
            g = await LiveGraph.find_by_key(req.data["LGID"], self.db)
            await g.fill(self.db)
            await req.answer(g.json_repr())


    # TODO currently permissions are a bit weird: handle_get will trust the Sensor/Value's is_authorized,
    # but handle_get_all will trust the User's is_authorized...
    @handle_ws_type("get_all")
    @require_user_level(1)
    class handle_get_all(switch_what):
        @case("Location")
        async def location(self, req):
            check_for_type(req, "User")
            u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
            await u.check_auth(req)
            locations = await Location.get(Location.user == u.key).order(Location.key).all(self.db)
            await req.answer([l.json_repr() for l in locations])

        @case("Like")
        async def like(self, req):
            check_for_type(req, "Status")
            s = await Status.find_by_key(req.metadata["for"]["SID"], self.db)
            await s.check_auth(req)
            likes = await Like.get(Like.status == s.key).order(Like.key).all(self.db)
            await req.answer([l.json_repr() for l in likes])

        @case("Sensor")
        class sensor(switch):
            select = lambda self, req: req.metadata["for"]["what"] if "for" in req.metadata else "Admin"

            @case("User")
            async def for_user(self, req):
                u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
                await u.check_auth(req)
                sensors = await Sensor.get(Sensor.user == u.key).order(Sensor.key).all(self.db)
                await req.answer([s.json_repr() for s in sensors])

            @case("Location")
            async def for_location(self, req):
                l = await Location.find_by_key(req.metadata["for"]["LID"], self.db)
                await l.check_auth(req)
                sensors = await Sensor.get(Sensor.location == l.key).order(Sensor.key).all(self.db)
                await req.answer([s.json_repr() for s in sensors])

            @case("Admin")
            async def for_admin(self, req):
                # Verify if the connection is a real admin for security reasonsx
                u = await User.find_by_key(req.conn.user.UID, self.db)
                if u.admin:
                    sensors = await Sensor.get().order(Sensor.key).all(self.db)
                    await req.answer([s.json_repr() for s in sensors])
                else:
                    await req.answer({"status":"failure", "reason":"You are not an admin."})

        @case("Value", "HourValue", "DayValue", "MonthValue", "YearValue")
        async def value(self, req):
            what_type = req.metadata["what"]
            value_cls, value_props = value_props_per_type[what_type]
            check_for_type(req, "Sensor")
            s = await Sensor.find_by_key(req.metadata["for"]["SID"], self.db)
            await s.check_auth(req)
            if "where" in req.metadata:
                clauses = []
                for c in req.metadata["where"]:
                    clauses.append(Where(value_props[c["field"]].name, op_codes[c["op"]], Unsafe(c["value"])))
                clauses.append(Where(value_props["sensor_SID"].name, "=", s.key))
                values = await value_cls.get(*clauses).all(self.db)
            else:
                values = await value_cls.get(value_cls.sensor == s.key).all(self.db)
            await req.answer([v.json_repr() for v in values])

        @case("User")
        async def user(self, req):
            check_for_type(req, "User")
            u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
            await u.check_auth(req)
            users = await User.get(User.key != u.key).order(User.key).all(self.db)
            await req.answer([u.json_repr() for u in users])

        @case("Group")
        async def group(self, req):
            if "for" in req.metadata:
                check_for_type(req, "User")
                u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
                await u.check_auth(req)
                groups = await Group.raw("SELECT  FROM table_Group WHERE table_Group.gid IN (SELECT table_Membership.group_gid FROM table_Membership WHERE table_Membership.user_uid = {0}) ORDER BY gid".format(req.metadata["for"]["UID"])).all(self.db)
                await req.answer([g.json_repr() for g in groups])
            else:
                groups = await Group.get(Group.public == True).all(self.db)
                await req.answer([g.json_repr() for g in groups])

        @case("Friendship")
        async def friendship(self, req):
            check_for_type(req, "User")
            u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
            await u.check_auth(req)
            friendships = await Friendship.get(Or(Friendship.user1 == u.key, Friendship.user2 == u.key)).order(Frienship.key).all(self.db)
            await req.answer([f.json_repr() for f in friendships])

        @case("Membership")
        async def membership(self, req):
            check_for_type(req, "Group")
            g = await Group.find_by_key(req.metadata["for"]["GID"], self.db)
            await g.check_auth(req)
            memberships = await Membership.get(Membership.group == g.key).order(Membership.key).all(self.db)
            await req.answer([m.json_repr() for m in memberships])

        @case("Tag")
        async def tag(self, req):
            if "for" in req.metadata:
                check_for_type(req, "Sensor")
                s = await Sensor.find_by_key(req.metadata["for"]["SID"], self.db)
                await s.check_auth(req)
                tags = await Tag.raw("SELECT * FROM table_Tag WHERE table_Tag.tid IN (SELECT table_Tagged.tag_tid FROM table_Tagged WHERE table_Tagged.sensor_sid = {0})".format(req.metadata["for"]["SID"])).all(self.db)
                await req.answer([t.json_repr() for t in tags])
            else:
                tags = await Tag.raw("SELECT * FROM table_Tag").all(self.db)
                await req.answer([t.json_repr() for t in tags])

        @case("Status")
        async def status(self, req):
            check_for_type(req, "Wall")
            w = await Wall.find_by_key(req.metadata["for"]["WID"], self.db)
            await w.check_auth(req)
            status = await Status.get(Status.wall == w.key).order(Status.key).all(self.db)
            await req.answer([s.json_repr() for s in status])

        @case("Comment")
        async def comment(self, req):
            check_for_type(req, "Status")
            s = await Status.find_by_key(req.metadata["for"]["SID"], self.db)
            await s.check_auth(req)
            comments = await Comment.get(Comment.status == s.key).order(Comment.key).all(self.db)
            await req.answer([c.json_repr() for c in comments])
        
        @case("LiveGraph")
        async def livegraph(self, req):
            lgs = await LiveGraph.get(LiveGraph.user == req.conn.user.key).order(LiveGraph.key).all(self.db)
            await req.answer([l.json_repr() for c in lgs])
        
    @handle_ws_type("edit")
    @require_user_level(1)
    class handle_edit(switch_what):
        @case("User")
        async def user(self, req):
            u = await User.find_by_key(req.data["UID"], self.db)
            await u.check_auth(req)
            u.edit_from_json(req.data)
            await u.update(self.db)
            await req.answer(u.json_repr())

        @case("Location")
        async def location(self, req):
            l = await Location.find_by_key(req.data["LID"], self.db)
            await l.check_auth(req)
            l.edit_from_json(req.data)
            await l.update(self.db)
            await req.answer(l.json_repr())

        @case("Sensor")
        async def sensor(self, req):
            s = await Sensor.find_by_key(req.data["SID"], self.db)
            await s.check_auth(req)
            s.edit_from_json(req.data)
            await s.update(self.db)
            await req.answer(s.json_repr())

        @case("Like")
        async def like(self, req):
            l = await Like.find_by_key((req.data["status_SID"], req.data["user_UID"]), self.db)
            await l.check_auth(req)
            l.edit_from_json(req.data)
            await l.update(self.db)
            await req.answer(l.json_repr())

        @case("Graph")
        async def graph(self, req):
            g = await Graph.find_by_key(req.data["GID"], self.db)
            g.edit_from_json(req.data)
            await g.update(self.db)
            await req.answer(g.json_repr())
        
        @case("LiveGraph")
        async def livegraph(self, req):
            g = await LiveGraph.find_by_key(req.data["LGID"], self.db)
            g.edit_from_json(req.data)
            await g.update(self.db)
            await req.answer(g.json_repr())

    @handle_ws_type("delete")
    @require_user_level(1)
    class handle_delete(switch_what):
        @case("Location")
        async def location(self, req):
            l = await Location.find_by_key(req.data["LID"], self.db)
            await l.check_auth(req)
            ss = await Sensor.get(Sensor.location == l.key).all(self.db)
            for s in ss:
                await s.delete(self.db)
            await l.delete(self.db)
            await req.answer({"status": "success"})

        @case("Status")
        async def status(self, req):
            s = await Status.find_by_key(req.data["SID"], self.db)
            await s.check_auth(req)
            await s.delete(self.db)
            await req.answer({"status": "success"})

        @case("Comment")
        async def comment(self, req):
            c = await Comment.find_by_key(req.data["CID"], self.db)
            if await c.can_delete(req.conn.user.UID, self.db):
                await c.delete(self.db)
                await req.answer({"status": "success"})
            else:
                await req.answer({"status":"failure", "reason":"You are not authorised to delete this comment."})

        @case("Like")
        async def like(self, req):
            l = await Like.find_by_key((req.data["status_SID"],req.data["user_UID"]), self.db)
            await l.check_auth(req)
            await l.delete(self.db)
            await req.answer({"status": "success"})

        @case("Membership")
        async def membership(self, req):
            m = await Membership.find_by_key((req.data["user_UID"],req.data["group_GID"]), self.db)
            await m.check_auth(req)
            await m.delete(self.db)
            await req.answer({"status": "success"})

        @case("Sensor")
        async def sensor(self, req):
            s = await Sensor.find_by_key(req.data["SID"], self.db)
            await s.check_auth(req)
            await s.delete(self.db)
            await req.answer({"status": "success"})

        @case("Friendship")
        async def friendship(self, req):
            f = await Friendship.find_by_key((req.data["user1_UID"],req.data["user2_UID"]), self.db)
            await f.check_auth(req)
            await f.delete(self.db)
            await req.answer({"status": "success"})

        @case("Tag")
        async def tag(self, req):
            if 'for' in req.metadata:
                check_for_type(req, "Sensor")
                s = await Sensor.find_by_key(req.metadata["for"]["SID"], self.db)
                await s.check_auth(req)
                tags = await Tag.raw("SELECT {} from table_Tag WHERE table_Tag.tid IN (SELECT table_Tagged.tag_tid FROM table_Tagged WHERE table_Tagged.sensor_sid = %(SID)s)".format(Tag._select_props), {"SID": req.metadata["for"]["SID"]}).all(self.db)
                for t in tags: await t.delete(self.db)
                await req.answer({"status": "succes"})
            else:
                # Get the sensor and the tag
                s = await Sensor.find_by_key(req.data["sensor_SID"], self.db)
                await s.check_auth(req)
                t = await Tag.get(Tag.description == Unsafe(req.data["text"])).single(self.db)
                await t.check_auth(req, db=self.db)
                # Get the relationship Tagged and delete it
                tagged = await Tagged.get(Tagged.sensor == s.key, Tagged.tag == t.key).single(self.db)
                await tagged.delete(self.db)
                # If the tag isn't needed elsewhere => delete it
                count = await Tagged.get(Tagged.tag == t.key).count(self.db)
                if count == 0: await t.delete(self.db)
                await req.answer({"status": "success"})

        @case("Graph")
        async def graph(self, req):
            g = await Graph.find_by_key(req.data["GID"], self.db)
            await g.delete(self.db)
            await req.answer({"status": "success"})
        
        @case("LiveGraph")
        async def livegraph(self, req):
            g = await LiveGraph.find_by_key(req.data["LGID"], self.db)
            await g.delete(self.db)
            await req.answer({"status": "success"})


    @handle_ws_type("get_secret_key")
    @require_user_level(1)
    async def handle_secret_key(self, req):
        s = await Sensor.find_by_key(req.data["SID"], self.db)
        await s.check_auth(req)
        if s.secret_key is None:
            s.secret_key = "".join([random.choice(random_chars) for i in range(50)])
            await s.update(self.db)
        await req.answer({"secret_key": s.secret_key})


    @handle_ws_type("reset_secret_key")
    @require_user_level(1)
    async def handle_reset_secret_key(self, req):
        s = await Sensor.find_by_key(req.data["SID"], self.db)
        await s.check_auth(req)
        s.secret_key = "".join([random.choice(random_chars) for i in range(50)])
        await s.update(self.db)
        await req.answer({"status": "success"})


    @handle_ws_type("create_graph")
    @require_user_level(1)
    async def handle_create_graph(self, req):
        base_wheres = []
        valueType = req.metadata["timespan"]["valueType"]
        group_by = req.metadata.get("group_by", [])
        #if valueType == "Value" and len(group_by) != 0:
        #    raise Error("no_group_by_permitted", "Grouping is not permitted when searching for raw values")

        value_cls, value_props = value_props_per_type[valueType]

        for c in req.metadata.get("where", []):
            val = c["value"] if not isinstance(c["value"], list) else tuple(c["value"])
            w = create_WhereInGraph(c["field"], c["op"], val)
            base_wheres.append(w)

        if not req.conn.user.admin:
            base_wheres.append(create_WhereInGraph("user_UID", "=", req.conn.user.UID))

        ts = req.metadata["timespan"]
        g = Graph(timespan_start = ts["start"], timespan_end = ts["end"], timespan_valuetype = ts["valueType"], title = req.metadata.get("title", "untitled"), user=req.conn.user.key)
        
        await g.build(base_wheres, group_by, self.db)

        GID = "temp" + str(random.randint(1,9999999))
        g.GID = GID
        req.conn.graph_cache[GID] = g

        await req.answer(g.json_repr())
    
    
    @handle_ws_type("create_live_graph")
    @require_user_level(1)
    async def handle_create_live_graph(self, req):
        base_wheres = []
        valueType = req.metadata["timespan"]["valueType"]
        group_by = req.metadata.get("group_by", [])

        value_cls, value_props = value_props_per_type[valueType]

        for c in req.metadata.get("where", []):
            val = c["value"] if not isinstance(c["value"], list) else tuple(c["value"])
            w = create_WhereInGraphLive(c["field"], c["op"], val)
            base_wheres.append(w)

        if not req.conn.user.admin:
            base_wheres.append(create_WhereInGraphLive("user_UID", "=", req.conn.user.UID))

        ts = req.metadata["timespan"]
        assert ts["end"] == 0, "Not very live"
        g = LiveGraph(timespan_start = ts["start"], timespan_end = ts["end"], timespan_valuetype = ts["valueType"], title = req.metadata.get("title", "untitled"), user=req.conn.user.key)
        
        await g.build(base_wheres, group_by, self.db)
        
        LGID = "temp" + str(random.randint(1,9999999))
        g.LGID = LGID
        req.conn.live_graph_cache[LGID] = g

        await req.answer(g.json_repr())
    
    
    @handle_ws_type("get_liveline_values")
    @require_user_level(1)
    async def handle_get_liveline_values(self, req):        
        if req.metadata["graph"] in req.conn.live_graph_cache:
            g = req.conn.live_graph_cache[req.metadata["graph"]]
        else:
            g = await LiveGraph.find_by_key(req.metadata["graph"], self.db)
            await g.fill(self.db)
        lines = []
        if len(g.lines) == 0:
            import pdb
            pdb.set_trace()
        for l in g.lines:
            lines.append(l.json_value_repr())
            print("Registering?")
            l.register_conn(req.conn)
        await req.answer({}, base_dct={"lines": lines})
    
    
    @handle_ws_type("delete_liveline_values")
    @require_user_level(1)
    async def handle_delete_liveline_values(self, req):
        if req.metadata["graph"] in req.conn.live_graph_cache:
            g = req.conn.live_graph_cache[req.metadata["graph"]]
        else:
            g = await LiveGraph.find_by_key(req.metadata["graph"], self.db)
            await g.fill(self.db)
        print("Now delete or something")
        for l in g.lines:
            l.unregister_conn(req.conn)
        # TODO clean up lingering livegraphs (perhaps also lingering graphs)?
        await req.answer({"status": "success"})
    
    
    @handle_ws_type("register", "unregister")
    @require_user_level(1)
    async def handle_registers(self, req):
        cls = self.model.classdict[req.metadata["what"]]
        key = [req.data[k.dataname] for k in cls.key.referencing_props()]
        key = key[0] if len(key) == 1 else tuple(key)
        obj = await cls.find_by_key(key, self.db)
        await obj.check_auth(req, db=self.db)
        if req.metadata["type"] == "register":
            obj.add_listener(req.conn)
        else:
            obj.remove_listener(req.conn)
        await req.answer({"status": "success"})

    @handle_ws_type("unregister_all")
    async def handle_unregister_all(self, req):
        req.conn.remove_all_listenees()
        await req.answer({"status": "success"})
