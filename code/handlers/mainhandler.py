import tornado

# Handlers are instantiated for every request!
def create_MainHandler(controller):
    f = open("html/base.html", "r")
    content = str(f.read())
    
    class MainHandler(tornado.web.RequestHandler):
        def get(self, *args):
            self.write(content)
            
        def post(self, *args):
            self.write(content)
    
    return MainHandler
