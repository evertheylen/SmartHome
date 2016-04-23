
import random

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
        "no_residents": random.randint(2,8)
    }
    
    return config


