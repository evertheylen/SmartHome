# tornado includes
import tornado.ioloop
import tornado.web

import os.path

# handles login of the overwatch webpage
class LoginHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')

# tornado needs to know where the html files etc are
settings = dict(template_path=os.path.join(os.path.dirname(__file__),"templates"),
    static_path = os.path.join(os.path.dirname(__file__),"static"),
    debug = True
)

# the webserver will run on the url "http://localhost:8888/overwatch"
application = tornado.web.Application([(r"/overwatch",LoginHandler)],**settings)

#start server at port 8888
print("Server is up and running, press ctrl+c to end")
application.listen(8888)
tornado.ioloop.IOLoop.instance().start()
