import tornado.ioloop
import tornado.web
import tornado.websocket

from tornado.options import define, options, parse_command_line

define("port", default=8888, help="run on the given port", type=int)

# All clients will be stored in a dictionary.
clients = dict()

class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("index.html")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, *args):
        self.id = self.get_argument("Id")
        self.stream.set_nodelay(True)
        clients[self.id] = {"id": self.id, "object": self}

    def on_message(self, message):        
        print ("Client %s received a message : %s" % (self.id, message))
        self.write_message("This is a message to the client with id: " + self.id)
        
    def on_close(self):
        if self.id in clients:
            del clients[self.id]


webSHandler = WebSocketHandler
app = tornado.web.Application([
      (r'/', IndexHandler),
      (r'/ws', webSHandler),
])

if __name__ == '__main__':
    parse_command_line()
    app.listen(options.port)
    try:
        tornado.ioloop.IOLoop.instance().start()

    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
