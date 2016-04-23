import tornado

# Handlers are instantiated for every request!
def create_UploadHandler(controller):
    class UploadHandler(tornado.web.RequestHandler):            
        def post(self, *args):
            fileinfo = self.request.files['file'][0]
            filename = fileinfo['filename']
            fbody = fileinfo['body']
            insert_live = self.get_argument("live")
            
            print(fbody)
    
    return UploadHandler

