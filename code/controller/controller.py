
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request
# You can however modify the listeners. TODO

from collections import defaultdict

class Controller:
    def __init__(self, logger, db, model):
        self.logger = logger
        self.db = db
        self.model = model
        
        self.listeners = defaultdict(set)
        # ID --> {jef, jos, maria}
    
    async def handle_message(self, conn, dct):
        users = await self.db.get_users()
        self.logger.debug("users = " + repr(users))
        if conn.session is None:
            conn.send("not logged in")
        else:
            conn.send("Welcome, " + conn.session)
    
