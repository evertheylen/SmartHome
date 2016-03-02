import tornado
import tornado.websocket
from tornado import gen

from util import *

import json

class Request:
    def __init__(self, conn, ID, dct):
        self.conn = conn
        self.ID = ID
        self.dct = dct
        
    async def answer(self, data):
        d = {
            "ID": self.ID,
            "type": self.dct["type"],
            "data": data
        }
        for prop in self.dct:
            if prop not in d:
                d[prop] = self.dct
        await self.conn.send(d)
    
def create_WsHandler(controller):
    clients = set()

    class WsHandler(tornado.websocket.WebSocketHandler):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)
            self.session = self.get_cookie("session")
            self.user = controller.get_user(self.session)
        
        # Reminder: the docs say this function *must* be synchronous
        def on_message(self, message):
            controller.logger.info("Server received message: " + message)
            try:
                dct = json.loads(message)
                #controller.handle_message(self, dct)
                # Because this function is synchronous, we must use the IOLoop to get the async loop 'back'
                r = Request(self, dct["ID"], dct)
                try:
                    tornado.ioloop.IOLoop.current().spawn_callback(controller.handle_request, r)
                except Authentication as e:
                    controller.logger.warning(str(e))
                    tornado.ioloop.IOLoop.current().spawn_callback(r.conn.send, {
                        "ID": r.ID,
                        "type": r.dct["type"],
                        "data": "fail",
                        "error": e.to_dict()
                    })
            except json.JSONDecodeError as e:
                controller.logger.warning("Server could not decode as JSON. Error: {}".format(message, e))
            except KeyError:
                controller.logger.warning("KeyError occured, wrong json?")


        async def send(self, dct):
            self.write_message(json.dumps(dct))

        def on_close(self):
            if self in clients:
                clients.remove(self)



    return WsHandler
