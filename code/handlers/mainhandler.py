import tornado

# Handlers are instantiated for every request!
def create_MainHandler(controller):
    # TODO cache html/index.html
    class MainHandler(tornado.web.RequestHandler):
        def get(self, *args):
            f = open("html/index.html", "r")
            content = str(f.read())
            self.write(content)
            
        def post(self, *args):
            self.write(content)
    
    return MainHandler
