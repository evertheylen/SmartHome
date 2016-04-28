
import io
import csv
from datetime import datetime

import tornado
from sparrow.sql import RawSql, SqlError

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
            controller.logger.info("Uploading...")
            fileinfo = self.request.files['file'][0]
            filename = fileinfo['filename']
            fbody = fileinfo['body']
            insert_live = len(self.get_arguments("live")) > 0
            
            f = io.StringIO(fbody.decode("utf-8"))
            reader = csv.reader(f, dialect=wtf_dialect)
            data = list(reader)
            
            sensors = []
            for i, name in enumerate(data[0][2:]):
                try:
                    csv_sensor = CsvSensor(name)
                    sensor = await Sensor.find_by_key(csv_sensor.ID, controller.db)
                    # TODO check_auth
                except Exception as e:
                    controller.logger.info("Something went wrong while searching for sensor with name {}: {}".format(name, e))
                    continue
                sensors.append((i, csv_sensor, sensor))
            
            times = []
            for row in data[1:]:
                time = int(datetime.strptime(row[0], csv_date_format).timestamp())
                #print(row[0], "\t", time)
                times.append(time)
            
            if len(sensors) == 0:
                controller.logger.info("No sensors???")
            
            for (i, csv_sensor, sensor) in sensors:
                values = []
                for j, row in enumerate(data[1:]):
                    value = (float(row[i+2]), times[j])
                    #print(value)
                    values.append(value)
                
                controller.logger.info("Inserting for sensor {}".format(sensor.SID))
                try:
                    await sensor.insert_values(values, controller.db)
                except SqlError as e:
                    controller.logger.error("Error in database: {}".format(e))
                    controller.logger.error("Moving on...")
            
                    
            
            
            
    
    return UploadHandler

