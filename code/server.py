
import logging
import os

import tornado
import tornado.websocket
import tornado.ioloop
import tornado.gen
import tornado.web

from tornado.options import define, options, parse_command_line

def localdir(location):
    return os.path.join(os.path.dirname(__file__), location)

# CLI arguments
define("port", default=8000, help="run on the given port", type=int)
define("serve_files", default=True, help="Also serve local files (makes the websocket server run on /ws)", type=bool)
define("jeroen_check", default=True, help="Checks whether you are in the right directory, frontend programmers will never learn", type=bool)

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

if options.serve_files:
    app = tornado.web.Application([
        (r'/ws', WsHandler), 
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': localdir("")})
    ])
    logging.info("Websocket server location = ws://localhost:%d/ws"%options.port)
    if options.jeroen_check:
        try:
            assert(os.path.isdir(localdir("static")))
            assert(os.path.isdir(localdir("html")))
            assert(os.path.isdir(localdir("js")))
        except Exception as e:
            logging.critical("Are you in the right directory? I got an error: " + str(e))
            logging.critical("(You can disable this check by setting --jeroen_check=false)")
            raise e
    logging.info("Also serving local files")
else:
    app = tornado.web.Application([(r'/(.*)', WsHandler)])
    logging.info("Websocket server location = ws://localhost:%d"%options.port)

app.listen(options.port)
tornado.ioloop.IOLoop.current().start()
