
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request
# You can however modify the listeners. TODO

import hashlib
import random
from functools import wraps

from collections import defaultdict
from model import *
from util import *

# Decorator
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


class Controller:
    def __init__(self, logger, db, model):
        self.logger = logger
        self.db = db
        self.model = model

        self.sessions = {}
        # Session --> UID

        self.listeners = ListenersCache()

    def get_user(self, session):
        if session in self.sessions:
            return self.sessions[session]
        else:
            return None
    
    
    async def permitted(self, user, obj):
        pass
    
    
    async def logout(self, req):
        self.sessions.pop(req.conn.session)
        req.conn.session = None
        req.conn.user = None

    
    async def login(self, req):
        res = await self.db.get(User.table_name, "email", req.dct["data"]["email"])
        if res is None: return
        u = User.from_db(res)

        # TODO IMPORTANT Don't store plaintext passwords
        if u.password == req.dct["data"]["password"]:
            session = hashlib.md5(bytes(str(random.random())[2:] + "WoordPopNoordzee", "utf8")).hexdigest()
            self.sessions[session] = u.UID
            req.conn.user = u
            req.conn.session = session
            await req.answer({"session": session, "user": u.to_dict()})
        else:
            raise Authentication("wrong_password", "Wrong password provided")
    
    async def signup(self, req):
        res = await self.db.get(User.table_name, "email", req.dct["data"]["email"])
        if res is not None:
            self.logger.error("Email %s already taken"%req.dct["data"]["email"])
            raise Error("email_taken", "Email is already taken")
        else:
            self.logger.debug("data = " + repr(req.dct["data"]))
            u = await User.new(self.db, req.dct["data"])
            await req.answer("success")
    
    
    async def register(self, req):
        # TODO permissions!
        pass
    
    
    async def unregister(self, req):
        pass
    
    
    async def conn_close(self, conn):
        self.listeners.unregister_all(conn)
    
    @require_user_level(1)
    async def add(self,req):
        if req.dct["what"] == "Sensor":
            if req.dct["data"]["UID"] == req.conn.user.UID:
                s = await Sensor.new(self.db, req.dct["data"])
                await req.answer(s.to_dict())
            else:
                raise Authentication("forbidden", "You can not access this sensor")
        elif req.dct["what"] == "Value":
            assert(req.dct["for"]["what"] == "Sensor")
            if (await Sensor.get(self.db,req.dct["for"]["SID"])).UID == req.conn.user.UID:
                new_dict = {"SID": req.dct["for"]["SID"],"time": req.dct["data"][0],"value": req.dct["data"][1]}
                v = await Value.new(self.db, new_dict)
                await req.answer(v.to_dict())
            else:
                raise Authentication("forbidden", "You can not access this sensor")


    @require_user_level(1)
    async def get(self, req):
        if req.dct["what"] == "Sensor":
            s = await Sensor.get(self.db, req.dct["data"]["ID"])
            await req.answer(s.to_dict())

    @require_user_level(1)
    async def get_all(self, req):
        # check if extra conditions are given
        if "for" in req.dct:
            if req.dct["for"]["what"] == "User" and req.dct["what"] == "Sensor":
                res = await self.db.get_multi(Sensor.table_name, "UID", req.dct["for"]["UID"])
                ss = [Sensor.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])

            elif req.dct["for"]["what"] == "Sensor" and req.dct["what"] == "Values":
                res = await self.db.get_multi(Value.table_name, "SID", req.dct["for"]["SID"])
                ss = [Value.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])
        else:
            if req.dct["what"] == "Sensor":
                res = await self.db.get_multi(Sensor.table_name, "UID", req.conn.user.UID)
                ss = [Sensor.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])


    @require_user_level(1)
    async def delete(self,req):
        if req.dct["what"] == "Sensor":
            s = await Sensor.delete(self.db, req.dct["data"]["ID"])
            # TODO rekening houden met sensors die reeds gedeleted zijn !
            await req.answer("success")
    
    
    async def handle_request(self, req):
        if req.dct["type"] in Controller.__dict__:
            # TODO only allow handle functions excplicitly allowed to handle incoming JSON messages
            await Controller.__dict__[req.dct["type"]](self, req)
        else:
            self.logger.error("No handler for %s in Controller"%req.dct["type"])

