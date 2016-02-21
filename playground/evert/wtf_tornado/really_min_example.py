import tornado
import tornado.websocket
import tornado.ioloop
import tornado.gen
import tornado.web

class NewWsHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    async def on_message(self, message):
        await self.write_message("echo " + message)

class OldWsHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True
    
    @tornado.gen.coroutine
    def on_message(self, message):
        yield self.write_message("echo " + message)


WsHandler = NewWsHandler

app = tornado.web.Application([(r'/', WsHandler)])
app.listen(8080)
tornado.ioloop.IOLoop.current().start()
