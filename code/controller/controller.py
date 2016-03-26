
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request

import hashlib
import random
from functools import wraps
from collections import defaultdict

from sparrow import *

from model import *
from util import *

# Decorators
# ==========

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


# The Controller
# ==============

# Metaclass
# ---------

class MetaController(type):
    def __new__(self, name, bases, dct):
        dct["wshandlers"] = {}
        # Detects functions marked with handle_ws_type
        for (n,f) in dct.items():
            if hasattr(f, "__handle_type__"):
                dct["wshandlers"][f.__handle_type__] = f
        return type.__new__(self, name, bases, dct)


# Actual class
# ------------

class Controller(metaclass=MetaController):
    def __init__(self, logger, model):
        self.logger = logger
        self.model = model

        self.sessions = {}
        # Session --> User.key
    
    @property
    def db(self):
        """Shortcut (simple getter)"""
        return self.model.db
    
    async def handle_request(self, req):
        # See metaclass
        if req.dct["type"] in Controller.wshandlers:
            await Controller.wshandlers[req.dct["type"]](self, req)
        else:
            self.logger.error("No handler for %s in Controller"%req.dct["type"])
    
    async def get_user(self, session):
        if session in self.sessions:
            return await User.get(self.db, self.sessions[session])
        else:
            return None
    
    
    # Websocket handlers
    # ------------------
    
    # TODO take queries out of function and add the to the model so they can be printed

    @handle_ws_type("signup")
    async def handle_signup(self, req):
        c = await User.get(User.email == Unsafe(req.data["email"])).count(self.db)
        if c >= 1:
            self.logger.error("Email %s already taken"%req.dct["data"]["email"])
            await req.answer({"status": "failure", "reason": "email_taken"})
        else:
            # TODO no plaintext password
            u = User(email=req.data["email"], password=req.data["password"],
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
    
        # TODO IMPORTANT Don't store plaintext passwords
        if u.password == req.data["password"]:
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
    async def handle_add(self, req):
        if req.metadata["what"] == "Sensor":
            if req.data["UID"] == req.conn.user.UID:
                s = Sensor(...)
                await req.answer(s.to_dict())
            else:
                raise Authentication("wrong", "You gave a wrong UID.")
        elif req.dct["what"] == "Value":
            assert(req.dct["for"]["what"] == "Sensor")
            if (await Sensor.get(self.db,req.dct["for"]["SID"])).UID == req.conn.user.UID:
                new_dict = {"SID": req.dct["for"]["SID"],"time": req.dct["data"][0],"value": req.dct["data"][1]}
                v = await Value.new(self.db, new_dict)
                await req.answer(v.to_dict())
            else:
                raise Authentication("forbidden", "You can not access this sensor")


    @handle_ws_type("get")
    @require_user_level(1)
    async def handle_get(self, req):
        if req.dct["what"] == "Sensor":
            s = await Sensor.get(self.db, req.dct["data"]["ID"])
            await req.answer(s.to_dict())
    
    
    @handle_ws_type("get_all")
    @require_user_level(1)
    async def get_all(self, req):
        # check if extra conditions are given
        if "for" in req.dct:
            if req.dct["for"]["what"] == "User" and req.dct["what"] == "Sensor":
                res = await self.db.get_multi(Sensor.table_name, "UID", req.dct["for"]["UID"])
                ss = [Sensor.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])

            elif req.dct["for"]["what"] == "Sensor" and req.dct["what"] == "Value":
                res = await self.db.get_multi(Value.table_name, "SID", req.dct["for"]["SID"])
                ss = [Value.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])
        else:
            if req.dct["what"] == "Sensor":
                res = await self.db.get_multi(Sensor.table_name, "UID", req.conn.user.UID)
                ss = [Sensor.from_db(t) for t in res]
                await req.answer([s.to_dict() for s in ss])


    @handle_ws_type("delete")
    @require_user_level(1)
    async def handle_delete(self,req):
        if req.dct["what"] == "Sensor":
            s = await Sensor.delete(self.db, req.dct["data"]["ID"])
            # TODO rekening houden met sensors die reeds gedeleted zijn !
            await req.answer("success")

