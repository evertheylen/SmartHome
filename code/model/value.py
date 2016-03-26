
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Value(OwEntity):
    value = Property(float)
    time = Property(int)
    sensor = Reference(Sensor)
    key = Key(sensor, time)
    
    async def is_authorized(self, type, usr, db, **kwargs):
        s = await Sensor.find_by_key(self.sensor).single(db)
        return s.user == usr.key
    
