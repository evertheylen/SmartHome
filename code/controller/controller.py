
# Controller is used by many Handlers, possibly concurrently
# So make sure it does NOT modify internal state while handling a request
# You can however modify the listeners. TODO

class Controller:
    def __init__(self, db, model):
        self.db = db
        self.model = model
        self.listeners = defaultdict(list)?

