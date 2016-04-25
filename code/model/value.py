
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
    @classmethod
    async def aggregate(time, sensor):
        # TODO aggregate :)
        # Step 1: get all values with Value.sensor == sensor and Value.time >= time and Value.time < time + 1 hour
        # Step 2: determine average
        # Step 3: Put those as HourValue, (always use starting point as 'time' attribute)
        pass

class DayValue(Value):
    pass

class MonthValue(Value):
    pass

class YearValue(Value):
    pass

