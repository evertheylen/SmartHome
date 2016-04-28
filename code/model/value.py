
from dateutil.relativedelta import relativedelta
import copy
from collections import defaultdict

from .owentity import *
from sparrow import *
from .sensor import Sensor

# wtf?
from datetime import datetime

def create_aggregate(_cls_big):
    @classmethod
    async def aggregate(cls_small, time, sensor, db, *, recurse=False, cls_big=_cls_big):
        # Step 1: get all values with Value.sensor == sensor and Value.time >= time and Value.time < time + 1 hour
        gap = cls_big.gap(time)
        print("class is ",repr(cls_small))
        result = await cls_small.get(cls_small.sensor == sensor, cls_small.time >= time, cls_small.time < time + gap).exec(db)
        values = result.all()
        
        # Step 2: determine average
        #count = result.count()  # nu-uh
        count = gap // cls_small.gap(time)
        total = sum([v.value for v in values])
        average = total/count if count != 0 else 0
        
        # Step 3: Put those as HourValue, (always use starting point as 'time' attribute)
        v = cls_big(value=average, sensor=sensor.key, time=time)
        await v.insert(db)
        
        if recurse:
            await cls_big.aggregate(cls_big.new_time(time), sensor, db, recurse=True)
    
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
    
    @classmethod
    async def clean(cls, db):
        now = datetime.now()
        yesterday = datetime(now.year, now.month, now.day) - relativedelta(days=1)
        r = RawSql("DELETE FROM table_value WHERE time < %(time)s",
                   {"time": yesterday.timestamp()})
        await r.exec(db)
    
    # Much different from the others!
    @classmethod
    async def aggregates_from_raw(cls, sensor, values, db, *, recurse=False):
        if len(values) == 1: return
        # values = tuples of (value, time)
        # Assume the values are ordered by time
        # Step 0: get the possible value before the first value in our input
        actual_start = values[0][1]
        r = RawSql("SELECT value FROM table_value WHERE time < %(start)s AND sensor_SID = %(sensor)s ORDER BY time DESC LIMIT 1",
                   {"start": actual_start, "sensor": sensor.SID})
        previous_val = (await r.raw(db)) or 0
        
        # Step 1: Divide into hours
        start_date = datetime.fromtimestamp(actual_start)
        start_date = datetime(start_date.year, start_date.month, start_date.day, start_date.hour)
        start = int(start_date.timestamp())
        print("Start", start_date, start)
        
        actual_end = values[-1][1]
        end_date = datetime.fromtimestamp(actual_end)
        if end_date.minute == end_date.second == 0:
            end_date = end_date + relativedelta(hours=1)
        else:
            end_date = datetime(end_date.year, end_date.month, end_date.day, end_date.hour) + relativedelta(hours=1)
        end = int(end_date.timestamp())
        print("End", end_date, end)
        
        current_index = 0
        for current in range(start, end, 3600):
            # Step 2: Calculate area under curve, determine average
            hour_start = current
            hour_end = current + 3600
            print("\nAggregating hour from {} to {}".format(hour_start, hour_end))
            
            # Step 2a: Get all values that are of importance
            # First determine the first value
            if values[current_index][1] == hour_start:
                hour_values = [values[current_index]]
            else:
                hour_values = [(previous_val, hour_start)]
            
            # Then all the rest
            try:
                while values[current_index][1] < hour_end:
                    hour_values.append(values[current_index])
                    current_index += 1
            except IndexError:
                pass
            
            # Add an extra value for handiness
            hour_values.append((999999, hour_end))
            print("Hour values:",hour_values)
            
            # Step 2b: determine area's
            hour_sum = 0
            for i, value in enumerate(hour_values[:-1]):
                width = hour_values[i+1][1] - value[1]
                hour_sum += width * value[0]
                print("hour_sum is now", hour_sum)
            
            # Step 2c: Insert the HourValue!
            hv = HourValue(value=hour_sum/60, time=hour_start, sensor=sensor.key)
            await hv.insert(db)  # TODO performance?
            print("Adding hour with value", hour_sum/3600)
        
        if recurse:
            await HourValue.aggregate(HourValue.new_time(start), sensor, db, recurse=True)


class YearValue(Value):
    @staticmethod
    def aggregate(*args, **kwargs):
        # YOU SHALL NOT PASS!
        pass
        # dangit
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.fromtimestamp(timestamp)
        assert date.month == date.day == 1
        assert date.hour == date.minute == date.second == 0
        next_year = date + relativedelta(years=1)
        delta = next_year - date
        return delta.total_seconds()


class MonthValue(Value):
    @classmethod
    async def aggregate(cls_small, time, sensor, db, *, recurse=False):
        # Do it differently        
        gap = YearValue.gap(time)
        date = datetime.fromtimestamp(time)
        current = date
        weights = []
        for i in range(12):
            result = await cls_small.get(cls_small.sensor == sensor, cls_small.time == current.timestamp()).exec(db)
            if result.count() == 1:
                mv = result.single()
                weights.append(mv.value * (cls_small.gap(current.timestamp()) / 86400))
            else:
                weights.append(0)
            current += relativedelta(months=1)
        average = sum(weights) / (gap / 86400)
        
        v = YearValue(value=average, sensor=sensor.key, time=time)
        await v.insert(db)
        
        # no recurse
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.fromtimestamp(timestamp)
        assert date.day == 1
        assert date.hour == date.minute == date.second == 0
        next_month = date + relativedelta(months=1)
        delta = next_month - date
        return delta.total_seconds()
        
    @staticmethod
    def new_time(old_time):
        old = datetime.fromtimestamp(old_time)
        new = datetime(old.year, 1, 1)
        return new.timestamp()

class DayValue(Value):
    aggregate = create_aggregate(MonthValue)
    gap = staticmethod(lambda t: 60*60*24)
    
    @staticmethod
    def new_time(old_time):
        old = datetime.fromtimestamp(old_time)
        new = datetime(old.year, old.month, 1)
        return new.timestamp()

class HourValue(Value):
    aggregate = create_aggregate(DayValue)
    gap = staticmethod(lambda t: 60*60)
    
    @staticmethod
    def new_time(old_time):
        old = datetime.fromtimestamp(old_time)
        new = datetime(old.year, old.month, old.day)
        return new.timestamp()
    
