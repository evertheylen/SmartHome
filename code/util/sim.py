
import random
import csv

from model import Location, Sensor

# Currently names are at random
names = ['Chest freezer', 'Fridge freezer', 'Refrigerator', 'Upright freezer', 'Answer machine', 'Cassette / CD Player', 'Clock', 'Cordless telephone', 'Hi-Fi', 'Iron', 'Vacuum', 'Fax', 'Personal computer', 'Printer', 'TV 1', 'TV 2', 'TV 3', 'VCR / DVD', 'TV Receiver box', 'Hob', 'Oven', 'Microwave', 'Kettle', 'Small cooking (group)', 'Dish washer', 'Tumble dryer', 'Washing machine', 'Washer dryer', 'DESWH', 'E-INST', 'Electric shower', 'Storage heaters', 'Other electric space heating']

async def create_elecsim_config(loc: Location, db, lights_sensor_ID=-1):
    sensors = await Sensor.get(Sensor.location == loc).all(db)
    appliances = []
    
    # Find possible
    if lights_sensor_ID == -1:
        for s in sensors:
            if s.title == "Lights":
                lights_sensor_ID = s.SID
                print("Found lights sensor")
    if lights_sensor_ID == -1:
        print("No ID for Lights sensor...")
    
    for s in sensors:        
        if s.SID != lights_sensor_ID:
            appliances.append("{} [{}]".format(random.choice(names), s.SID))
    
    config = {
        "appliances": appliances,
        "id_household": loc.LID,
        "lights_house": 1,  # ?
        "lights_irradiance": random.randint(10,80),
        "lights_id": lights_sensor_ID,
        "no_residents": random.randint(1,5)
    }
    
    return config


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

elecsim_dialect = csv.excel
elecsim_dialect.delimiter = ";"
