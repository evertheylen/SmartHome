
import tornado
import tornado.websocket
from tornado import gen

import sparrow

from util import *

import json

class Request:
    def __init__(self, conn, ID, dct):
        self.conn = conn
        self.ID = ID
        self.metadata = dct
        self.data = dct["data"]
        
    async def answer(self, dct, base_dct={}):
        base_dct["ID"] = self.ID
        base_dct["type"] = self.metadata["type"]
        base_dct["data"] = dct
        
        for prop in self.metadata:
            if prop not in base_dct:
                base_dct[prop] = self.dct[prop]
        await self.conn.send(base_dct)
    
async def wrap_errors(controller, req):
    try:
        await controller.handle_request(req)
    except Error as e:
        controller.logger.warning(str(e))
        await req.conn.send({
            "ID": req.ID,
            "type": req.metadata["type"],
            "data": "failure",
            "error": e.json_repr()
        })


def create_WsHandler(controller):
    clients = set()

    class WsHandler(tornado.websocket.WebSocketHandler, sparrow.Listener):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)
            self.session = self.get_cookie("session")
            self.user = None
            self.listenees = set()
            tornado.ioloop.IOLoop.current().spawn_callback(self.open_async)
        
        
        # Websocket methods
        # -----------------
        
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

        
        # Listener methods
        # ----------------
        
        def _add_listenee(self, obj):
            self.listenees.add(obj)
        
        def _remove_listenee(self, obj):
            self.listenees.remove(obj)
        
        

    return WsHandler
