
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Value(OwEntity):
    value = Property(float)
    time = Property(int)
    sensor = Reference(Sensor)
    key = Key(sensor, time)
    
    def json_repr(self):
        """format is ``[time, value]`` (to save space)"""
        return [self.time, self.value]
    
    async def is_authorized(self, type, usr, db, **kwargs):
        s = await Sensor.find_by_key(self.sensor).single(db)
        return s.user == usr.key
    

class HourValue(Value):
    pass

class DayValue(Value):
    pass

class MonthValue(Value):
    pass

class YearValue(Value):
    pass

