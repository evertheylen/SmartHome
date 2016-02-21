import tornado
import tornado.websocket

def create_WsHandler(controller):
    clients = set()
    
    class WsHandler(tornado.websocket.WebSocketHandler):
        def open(self, *args):
            #self.stream.set_nodelay(True)
            controller.logger.info("Server opened connection")
            clients.add(self)

        def async on_message(self, message):
            controller.logger.info("Server received a message : %s" % (message))
            for c in clients:
                await c.write_message("Broadcast: " + message)

    def on_close(self):
        if self in clients:
            clients.remove(self)
    
    return WsHandler

