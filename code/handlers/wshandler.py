
import tornado
import tornado.websocket
from tornado import gen

import pdb
tb = pdb.traceback
import urllib

import sparrow

from util import *

import json

class Request:
    def __init__(self, conn, ID, dct):
        self.conn = conn
        self.ID = ID
        self.metadata = dct
        self.data = dct.get("data", {})
        
    async def answer(self, dct, base_dct=None):
        if base_dct is None:
            base_dct = {}
        base_dct["ID"] = self.ID
        base_dct["type"] = self.metadata["type"]
        base_dct["data"] = dct
        
        for prop in self.metadata:
            if prop not in base_dct:
                base_dct[prop] = self.metadata[prop]
        await self.conn.send(base_dct)
    
    async def error(self, dct):
        await self.conn.send({
            "ID": self.ID,
            "type": self.metadata["type"],
            "data": "failure",
            "error": dct
        })
    
issue_text = """

Exception while responding to JSON message.

**How to reproduce**:


                                                                                                                        <<<<<<< EDIT ME


JSON message:

```
{msg}
```

**Expected results**:


                                                                                                                        <<<<<<< EDIT ME


**Traceback**:

```
{traceback}
```

"""

async def debug_wrap_errors(controller, req):
    try:
        await controller.handle_request(req)
    except Error as e:
        controller.logger.warning(str(e))
        await req.error(e.json_repr())
    except Exception as e:
        body = issue_text.format(traceback=tb.format_exc(), msg=json.dumps(req.metadata, indent=4))
        title = "Exception in backend: " + str(e)
        url = "https://github.com/evertheylen/SmartHome/issues/new?title={title}&body={body}".format(
            title=urllib.parse.quote_plus(title), body=urllib.parse.quote_plus(body))
        controller.logger.error(tb.format_exc())
        await req.error({"short": "fatal", "long": "PLEASE make a github issue by clicking here: {}".format(url)})
    
    
async def normal_wrap_errors(controller, req):
    try:
        await controller.handle_request(req)
    except Error as e:
        controller.logger.warning(str(e))
        await req.error(e.json_repr())
    except Exception as e:
        controller.logger.error(tb.format_exc())


def create_WsHandler(controller, debug=True):
    clients = set()
    
    if debug:
        wrap_errors = debug_wrap_errors
    else:
        wrap_errors = normal_wrap_errors
    
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

        async def send(self, dct):
            msg = json.dumps(dct)
            controller.logger.info("Server sent message: " + msg)
            self.write_message(msg)
        
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
