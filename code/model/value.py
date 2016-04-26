
import datetime
from dateutil.relativedelta import relativedelta
import copy

from .owentity import *
from sparrow import *
from .sensor import Sensor

def create_aggregate(_cls_big):
    @classmethod
    async def aggregate(cls_small, time, sensor, db, *, recurse=False, cls_big=_cls_big):
        # Step 1: get all values with Value.sensor == sensor and Value.time >= time and Value.time < time + 1 hour
        result = await cls_small.get(cls_small.sensor == sensor, cls_small.time >= time, cls_small.time < time + _cls_big.gap(time)).exec(db)
        values = result.all()
        
        # Step 2: determine average
        count = result.count()
        total = sum([v.value for v in values])
        average = total/count if count != 0 else 0
        
        # Step 3: Put those as HourValue, (always use starting point as 'time' attribute)
        v = cls_big(value=average, sensor=sensor.key, time=time)
        await v.insert(db)
        
        if recurse:
            cls_big.aggregate(time, sensor, db, recurse=recurse)
    
    return aggregate


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


class YearValue(Value):
    @staticmethod
    def aggregate(*args, **kwargs):
        # YOU SHALL NOT PASS!
        pass
        # dangit
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.datetime.fromtimestamp(timestamp)
        assert date.month == date.day == date.hour == date.minute == date.second == 0
        next_year = date + relativedelta(years=1)
        delta = next_year - date
        return delta.total_seconds()

class MonthValue(Value):
    aggregate = create_aggregate(YearValue)
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.datetime.fromtimestamp(timestamp)
        assert date.day == date.hour == date.minute == date.second == 0
        next_month = date + relativedelta(months=1)
        delta = next_month - date
        return delta.total_seconds()
        


class DayValue(Value):
    aggregate = create_aggregate(MonthValue)
    gap = staticmethod(lambda t: 60*60*24)


class HourValue(Value):
    aggregate = create_aggregate(DayValue)
    gap = staticmethod(lambda t: 60*60)


Value.aggregate = create_aggregate(HourValue)
