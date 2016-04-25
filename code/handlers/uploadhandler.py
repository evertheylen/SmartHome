
import io
import csv
from datetime import datetime

import tornado
from sparrow.sql import RawSql

from model import *

wtf_dialect = csv.excel
wtf_dialect.delimiter = ";"

# Copy pasted from ElecSim
# Because I don't want a single import of that horrendous code in this
# project, here I prefer copy-pasting.

class CsvSensor:
    def __init__(self, name):
        self.ID = int(name[name.find("[")+1:name.find("]")])
        name = name[:name.find("[")] + name[name.find("]")+1:]
        self.appname = name.strip()
    
    @property
    def full_name(self):
        return "{s.appname} [{s.ID}]".format(s=self)

csv_date_format = "%Y-%m-%d %H:%M:%S"

def create_UploadHandler(controller):
    class UploadHandler(tornado.web.RequestHandler):            
        async def post(self, *args):
            # TODO security
            fileinfo = self.request.files['file'][0]
            filename = fileinfo['filename']
            fbody = fileinfo['body']
            insert_live = len(self.get_arguments("live")) > 0
            
            f = io.StringIO(fbody.decode("utf-8"))
            reader = csv.reader(f, dialect=wtf_dialect)
            data = list(reader)
            
            sensors = []
            for i, name in enumerate(data[0][2:-1]):
                csv_sensor = CsvSensor(name)
                try:
                    sensor = await Sensor.find_by_key(csv_sensor.ID, controller.db)
                    # TODO check_auth
                except:
                    controller.logger.info("Something went wrong while searching for sensor with ID {}".format(csv_sensor.ID))
                    continue
                sensors.append((i, CsvSensor(name), sensor))
                
            values = []
            for (i, csv_sensor, sensor) in sensors:
                for row in data[1:]:
                    value = row[i+2]
                    time = datetime.strptime(row[0], csv_date_format).timestamp()
                    # TODO MAJOR SQL LEAK
                    values.append((value, time, sensor.SID))
                c = RawSql("INSERT INTO table_Value VALUES " + ", ".join([str(v) for v in values]))
                await c.exec(controller.db)
            
                    
            
            
            
    
    return UploadHandler

