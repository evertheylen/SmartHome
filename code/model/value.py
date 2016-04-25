
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
    async def aggregate(time, sensor, db):
        # Step 1: get all values with Value.sensor == sensor and Value.time >= time and Value.time < time + 1 hour
        result = await Value.get(Value.sensor == sensor, Value.time >= time, Value.time < time + 3600).exec(db)
        values = result.all()
        # Step 2: determine average
        count = result.count()
        total = sum([v.value for v in values])
        average = total/count
        # Step 3: Put those as HourValue, (always use starting point as 'time' attribute)
        
        
        

class DayValue(Value):
    pass

class MonthValue(Value):
    pass

class YearValue(Value):
    pass
