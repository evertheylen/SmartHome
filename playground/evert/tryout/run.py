
import os

from collections import defaultdict

import tornado.ioloop
import tornado.web

from tornado.options import define, options, parse_command_line


define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")


# Fake DB
database = {
    1: 12.85,
    2: 784.124,
    3: 78.4
}

class Database:
    def __init__(self):
        global database
        self.data = database
    
    def update(self, ID, val):
        # Also creates
        self.data[ID] = val
    
    def insert(self, ID, val):
        self.data[ID] = val
    
    def delete(self, ID):
        self.data.remove(ID)
        
    def get_value(self, ID):
        return self.data[ID]
    
    def list_sensors(self):
        yield from self.data.items()



class MainHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.db = Database()
        self.listeners = defaultdict(list)  # ID -> [listener, listener, ...] (default empty)
        
    def get(self):
        self.write(str(self.db.get_value(1)))


def make_app():
    return tornado.web.Application(
        [(r"/", MainHandler)],
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static")
    )

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()
