
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request
# You can however modify the listeners. TODO

import hashlib
import random

from collections import defaultdict
from model import *

# Testing
def add_user(loc):
    locals().update(loc)
    u = User.new(self.db, {"first_name": "Evert"})

class Controller:
    def __init__(self, logger, db, model):
        self.logger = logger
        self.db = db
        self.model = model

        self.sessions = {}
        # Session --> UID
        
        self.listeners = defaultdict(lambda: defaultdict(set))  # TODO
        # Type --> ID --> {jef, jos, maria}
    
    def get_user(self, session):
        if session in self.sessions:
            return self.sessions[session]
        else:
            return None
    
    # Logout: remove session from self.sessions
    
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
            await req.answer({"session": session})
        else:
            await req.answer("fail")
    
    async def signup(self, req):
        res = await self.db.get(User.table_name, "email", req.dct["data"]["email"])
        if res is not None:
            self.logger.error("Email %s already taken"%req.dct["data"]["email"])
            await req.answer("fail")
        else:
            self.logger.debug("data = " + repr(req.dct["data"]))
            u = await User.new(self.db, req.dct["data"])
            await req.answer("success")
    
    async def handle_request(self, req):
        if req.dct["type"] in Controller.__dict__:
            await Controller.__dict__[req.dct["type"]](self, req)
        else:
            self.logger.error("No handler for %s in Controller"%req.dct["type"])
    
    async def _handle_message(self, conn, dct):
        u = await User.new(self.db, {"first_name": "Evert", "last_name": "Heylen", "password": "123", "email": "e@e"})
        await conn.send({"answer": u.to_dict()})
        await u.set(self.db, "first_name", "Anthony")
        new_u = User.get(self.db, u.UID)
        await conn.send({"user": u.to_dict()})
        
        