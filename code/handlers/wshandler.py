
import sys
import pdb
tb = pdb.traceback
import urllib
import json

import tornado
import tornado.websocket
from tornado import gen

import sparrow

from util import *


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
            "type": "error",
            "data": dct,
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

async def create_github_link(controller, req, e):
    body = issue_text.format(traceback=tb.format_exc(), msg=json.dumps(req.metadata, indent=4))
    title = "Exception in backend: " + type(e).__name__ + ": " + str(e)
    url = "https://github.com/evertheylen/SmartHome/issues/new?title={title}&body={body}".format(
        title=urllib.parse.quote_plus(title), body=urllib.parse.quote_plus(body))
    controller.logger.error(tb.format_exc())
    await req.error({"short": "fatal", "long": "PLEASE make a github issue by clicking here: {}".format(url)})


async def simply_log(controller, req, exc):
    controller.logger.error(tb.format_exc())


def manual_exception_chain(a, b):
    try:
        raise a from b
    except Exception as e:
        return e

async def handle_error(e, controller, req, backup):
    if isinstance(e, Error):
        controller.logger.warning(str(e))
        controller.logger.warning(tb.format_exc())
        await req.error(e.json_repr())
    elif isinstance(e, sparrow.NotSingle):
        e = manual_exception_chain(NotFound(str(e)), e)
        await handle_error(e, controller, req, backup)  # yay error recursion
    else:
        await backup(controller, req, e)
    

def create_wrap_errors(_backup):
    def f(backup=_backup):
        async def wrap_errors(controller, req, backup=_backup):
            try:
                await controller.handle_request(req)
            except Exception as e:
                await handle_error(e, controller, req, backup)
        return wrap_errors
    return f()


def create_WsHandler(controller, debug=True):
    clients = set()
    
    wrap_errors = create_wrap_errors(create_github_link if debug else simply_log)
    
    class WsHandler(tornado.websocket.WebSocketHandler, sparrow.Listener):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)
            self.session = self.get_cookie("session")
            self.user = None
            self.listenees = set()
            self.graph_cache = {}
            controller.ow.ioloop.spawn_callback(self.open_async)
        
        
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
                
                controller.ow.ioloop.spawn_callback(wrap_errors, controller, r)
            except json.JSONDecodeError as e:
                controller.logger.warning("Server could not decode as JSON. Error: {}".format(message, e))

        async def send(self, dct):
            msg = json.dumps(dct)
            controller.logger.info("Server sent message: " + msg)
            self.write_message(msg)
        
        def on_close(self):
            if self in clients:
                clients.remove(self)
            controller.ow.ioloop.spawn_callback(controller.conn_close, self)

        
        def remove_all_listeners(self):
            for l in self.listenees:
                l.remove_listener(self)
            self.listenees.clear()
        
        # Listener methods
        # ----------------
        
        
        def _add_listenee(self, obj):
            self.listenees.add(obj)
        
        def _remove_listenee(self, obj):
            self.listenees.remove(obj)
        
        def update(self, obj):
            """Handle updates to the object."""
            controller.ow.ioloop.spawn_callback(self.send, {
                "type": "live_edit",
                "what": type(obj).__name__,
                "data": obj.json_repr()
                })
        
        def delete(self, obj):
            """Handle deletions of the object."""
            controller.ow.ioloop.spawn_callback(self.send, {
                "type": "live_delete",
                "what": type(obj).__name__,
                "data": obj.json_repr()
                })
        
        def new_reference(self, obj, ref_obj):
            """Handle a new reference from `ref_obj` to `obj`. `ref_obj` does not have to be a
            `RTEntity`.
            """
            controller.ow.ioloop.spawn_callback(self.send, {
                "type": "live_add",
                "for": obj.json_key(),
                "what": type(ref_obj).__name__,
                "data": ref_obj.json_repr(),
                })
            
        def remove_reference(self, obj, ref_obj):
            """Handle the removal of a reference from `ref_obj` to `obj`. `ref_obj` does not 
            have to be a `RTEntity`.
            """
            controller.logger.info("I sent an experimental message for which is there is no format yet, I doubt Jeroen can handle it ;)")
            controller.ow.ioloop.spawn_callback(self.send, {
                "type": "live_delete_ref",
                "for": obj.json_key(),
                "data": ref_obj.json_key(),
                })
        

    return WsHandler
