import tornado

# Handlers are instantiated for every request!
def create_MainHandler(controller):
    class MainHandler(tornado.web.RequestHandler):
        def get(self):
            val = controller.db.get_value(1)
            self.write(str(val))
            controller.db.update(1, val*2)
    
    return MainHandler
