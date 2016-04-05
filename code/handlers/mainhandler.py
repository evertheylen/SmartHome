import tornado

from overwatch import localdir

# Handlers are instantiated for every request!
def create_MainHandler(controller):
    # TODO cache html/index.html
    class MainHandler(tornado.web.RequestHandler):
        def get(self, *args):
            f = open(localdir("html/index.html"), "r")
            content = str(f.read())
            self.write(content)
            
        def post(self, *args):
            f = open(localdir("html/index.html"), "r")
            content = str(f.read())
            self.write(content)
    
    return MainHandler
