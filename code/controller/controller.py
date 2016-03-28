
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request

import hashlib
import random
from functools import wraps
from collections import defaultdict
import types
from concurrent.futures import ThreadPoolExecutor
import passlib.hash  # For passwords

from sparrow import *

from model import *
from util import *


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


def handle_ws_type(typ):
    def decorator(method):
        method.__handle_type__ = typ
        return method
    return decorator



# Metaclasses
# -----------

class MetaController(type):
    def __new__(self, name, bases, dct):
        dct["wshandlers"] = {}
        # Detects functions marked with handle_ws_type
        for (n,f) in dct.items():
            if hasattr(f, "__handle_type__"):
                dct["wshandlers"][f.__handle_type__] = f
        return type.__new__(self, name, bases, dct)


# Actual little helper functions
# ------------------------------

def check_for_type(req: "Request", typ: str):
    if not req.metadata["for"]["what"] == typ:
        raise Error("wrong_object_type", "Wrong object type in for.what")


# The Controller
# ==============

class Controller(metaclass=MetaController):
    executor = ThreadPoolExecutor(4)
    
    # General methods
    # ---------------
    
    def __init__(self, logger, model):
        self.logger = logger
        self.model = model

        self.sessions = {}
        # Session --> User.key
    
    async def handle_request(self, req):
        # See metaclass
        # Kind of a @switch class too, but I'd like to keep it flat
        if req.metadata["type"] in Controller.wshandlers:
            await Controller.wshandlers[req.metadata["type"]](self, req)
        else:
            self.logger.error("No handler for %s in Controller"%req.metadata["type"])
    
    async def get_user(self, session):
        if session in self.sessions:
            return await User.find_by_key(self.sessions[session], self.db)
        else:
            return None
    
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
            u = User(email=req.data["email"], password=hash,
                     first_name=req.data["first_name"], last_name=req.data["last_name"])
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
        @case("Sensor")
        async def sensor(self, req):
            if req.data["UID"] == req.conn.user.UID:
                s = Sensor(json_dict=req.data)
                await s.insert()
                await req.answer(s.json_repr())
            else:
                raise Authentication("wrong", "You gave a wrong UID.")
        
        @case("Value")
        async def value(self, req):
            check_for_type(req, "Sensor")
            v = Value(sensor=req.metadata["for"]["SID"], time=req.data[0], value=req.data[1])
            v.check_auth(req, db=self.db)
            await v.insert(self.db)
            await req.answer(v.json_repr())

    @handle_ws_type("get")
    @require_user_level(1)
    class handle_get(switch_what):
        @case("Sensor")
        async def sensor(self, req):
            s = await Sensor.find_by_key(req.data["SID"], self.db)
            await s.check_auth(req)
            await req.answer(s.json_repr())
    
    
    @handle_ws_type("get_all")
    @require_user_level(1)
    class handle_get_all(switch_what):
        @case("Sensor")
        async def sensor(self, req):
            check_for_type("User")
            u = await User.find_by_key(req.metadata["for"]["UID"], self.db)
            await u.check_auth(req)
            sensors = await Sensor.get(Sensor.user == u.key).all(self.db)
            await req.answer([s.json_repr() for s in sensors])
        
        @case("Value")
        async def value(self, req):
            check_for_type("Sensor")
            s = await Sensor.find_by_key(req.metadata["for"]["SID"], self.db)
            await s.check_auth(req)
            values = await Value.get(Value.sensor == s.key).all(self.db)
            await req.answer([s.json_repr() for v in values])


    @handle_ws_type("delete")
    @require_user_level(1)
    class handle_delete(switch_what):
        @case("Sensor")
        async def sensor(self, req):
            s = await Sensor.find_by_key(req.data["SID"], self.db)
            s.check_auth(req)
            await s.delete(self.db)
            # TODO rekening houden met sensors die reeds gedeleted zijn!
            await req.answer({"status": "success"})

