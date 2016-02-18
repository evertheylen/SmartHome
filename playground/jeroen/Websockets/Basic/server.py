import tornado.ioloop
import tornado.web
import tornado.websocket

from tornado.options import define, options, parse_command_line

define("port", default=8888, help="run on the given port", type=int)

class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("index.html")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, *args):
        print ("New connection")

    def on_message(self, message):        
        print ("Recieved a message from client: " + message)
        self.write_message("This is a message to the client.")
        print ("Sent back a message to the client")
        

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
