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

class DataBaseHandler(tornado.websocket.WebSocketHandler):
    def get(self):
        self.id = self.get_argument("Id")
        self.stream.set_nodelay(True)
        clients[self.id] = {"id": self.id, "object": self}        

    def on_message(self, message):
        print ("Server %s received a message : %s" % (self.id, message))
        database = tornado.database.Connection(
            host="mysql6.000webhost.com", database="a4601813_db1",
            user="a4601813_db1", password="databases1")
        # Do some fancy translation from a structured string to SQL
        rows = db.query("SOME SQL QUERY")
        database.close()
        self.write_message("Message containing information from the database.")

    def on_close(self):
        if self.id in clients:
            del clients[self.id]
         

webSHandler = WebSocketHandler
app = tornado.web.Application([
      (r'/', IndexHandler),
      (r'/ws', DataBaseHandler),
])

if __name__ == '__main__':
    parse_command_line()
    app.listen(options.port)
    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.instance().stop()
