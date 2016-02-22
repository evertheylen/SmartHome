
import logging

import tornado
import tornado.websocket
import tornado.ioloop
import tornado.gen
import tornado.web

from tornado.options import define, options, parse_command_line

# CLI arguments
define("port", default=8888, help="run on the given port", type=int)

clients = set()
counter = 1

class WsHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self, *args):
        global counter
        self.ID = counter
        counter += 1
        logging.info("Opened connection %d"%self.ID)
        clients.add(self)

    def close(self, *args):
        clients.remove(self)
        logging.info("Closed connection %d"%self.ID)

    def on_message(self, message):
        logging.info("Got `%s` from client %d"%(message, self.ID))
        for c in clients:
            if c is not self:
                c.write_message(message)
        c.write_message("Broadcasted your message `%s`"%message)
    
    

parse_command_line()

logging.info("You can use http://www.websocket.org/echo.html to send messages. The server will broadcast that message to all registered clients.")
logging.info("Location = ws://localhost:%d"%options.port)

app = tornado.web.Application([(r'/(.*)', WsHandler)])
app.listen(options.port)
tornado.ioloop.IOLoop.current().start()
