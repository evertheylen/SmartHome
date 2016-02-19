import tornado

def create_TestHandler(controller):
    class TestHandler(tornado.web.RequestHandler):
        def get(self):
            self.write("test")
    
    return TestHandler
