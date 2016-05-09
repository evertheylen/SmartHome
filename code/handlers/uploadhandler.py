
import tornado

def create_UploadHandler(controller):
    class UploadHandler(tornado.web.RequestHandler):            
        async def post(self, *args):
            # TODO security
            controller.logger.info("Uploading...")
            fileinfo = self.request.files['file'][0]
            filename = fileinfo['filename']
            fbody = fileinfo['body']
            insert_live = len(self.get_arguments("live")) > 0
            await controller.insert_csv_file(fbody, insert_live)
            
            
                    
            
            
            
    
    return UploadHandler

