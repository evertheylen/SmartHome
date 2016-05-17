
import tornado

from model.sensor import Sensor

def create_DataHandler(controller):
    class DataHandler(tornado.web.RequestHandler):            
        async def post(self, *args):
            await controller.add_live_value(int(self.get_argument("SID")),
                  str(self.get_argument("secret_key")), 
                  float(self.get_argument("value")))
    
    return DataHandler


