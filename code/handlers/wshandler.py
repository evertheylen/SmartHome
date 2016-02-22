import tornado
import tornado.websocket
from tornado import gen

import json

def create_WsHandler(controller):
    clients = set()

    class WsHandler(tornado.websocket.WebSocketHandler):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)
            self.session = self.get_cookie("session")
        
        # Reminder: the docs say this function *must* be synchronous
        def on_message(self, message):
            controller.logger.info("Server received message: " + message)
            try:
                dct = json.loads(message)
                #controller.handle_message(self, dct)
                # Because this function is synchronous, we must use the IOLoop to get the async loop 'back'
                tornado.ioloop.IOLoop.current().spawn_callback(controller.handle_message, self, dct)
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
