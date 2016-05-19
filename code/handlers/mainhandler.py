import tornado

from overwatch import localdir

# Handlers are instantiated for every request!
def create_MainHandler(controller):
    # TODO cache html/index.html
    if not controller.ow.debug:
        f = open(localdir("html/index.html"), "r")
        content = str(f.read())
    
    class MainHandler(tornado.web.RequestHandler):
        def get(self, *args):
            if controller.ow.debug:
                f = open(localdir("html/index.html"), "r")
                content = str(f.read())
            self.write(content)
            
        post = get
    
    return MainHandler
