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
                d[prop] = self.dct[prop]
        await self.conn.send(d)
    
async def wrap_errors(controller, req):
    try:
        await controller.handle_request(req)
    except Error as e:
        controller.logger.warning(str(e))
        await req.conn.send({
            "ID": req.ID,
            "type": req.dct["type"],
            "data": "fail",
            "error": e.to_dict()
        })


def create_WsHandler(controller):
    clients = set()

    class WsHandler(tornado.websocket.WebSocketHandler):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)
            self.session = self.get_cookie("session")
            tornado.ioloop.IOLoop.current().spawn_callback(controller.open_async, self)
        
        async def open_async(self):
            self.user = await controller.get_user(self.session)
        
        # Reminder: the docs say this function *must* be synchronous
        def on_message(self, message):
            controller.logger.info("Server received message: " + message)
            try:
                dct = json.loads(message)
                #controller.handle_message(self, dct)
                # Because this function is synchronous, we must use the IOLoop to get the async loop 'back'
                r = Request(self, dct["ID"], dct)
                
                tornado.ioloop.IOLoop.current().spawn_callback(wrap_errors, controller, r)
            except json.JSONDecodeError as e:
                controller.logger.warning("Server could not decode as JSON. Error: {}".format(message, e))
            except KeyError:
                controller.logger.warning("KeyError occured, wrong json?")


        async def send(self, dct):
            self.write_message(json.dumps(dct))

        def on_close(self):
            if self in clients:
                clients.remove(self)
            tornado.ioloop.IOLoop.current().spawn_callback(controller.conn_close, self)



    return WsHandler
