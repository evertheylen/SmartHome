
from dateutil.relativedelta import relativedelta
import copy
from collections import defaultdict

from .owentity import *
from sparrow import *
from .sensor import Sensor

# wtf?
from datetime import datetime

import time
now = lambda: round(time.time())


class Aggregated:
    @classmethod
    async def aggregate(cls, times, sensor, db):
        for time in times:
            # Step 1: get all values with Value.sensor == sensor and Value.time >= time and Value.time < time + 1 hour
            gap = cls.big_cls.gap(time)
            result = await cls.get(cls.sensor == sensor, cls.time >= time, cls.time < time + gap).exec(db)
            values = result.all()
            
            # Step 2: determine average
            #count = result.count()  # nu-uh
            count = round(gap / cls.gap(time))
            total = sum([v.value for v in values])
            average = total/count if count != 0 else 0
            
            # Step 3: Put those as big_cls, (always use starting point as 'time' attribute)
            v = cls.big_cls(value=average, sensor=sensor.key, time=time)
            await v._simple_insert(db)
    
    @classmethod
    async def live_aggregate(cls, SID, start, db):
        # The goal is to select all the values we need, determine some average,
        # and insert it, easy.
        end = start + cls.big_cls.gap(start)
        
        result = await cls.get(cls.sensor == SID, cls.time >= start, cls.time < end).exec(db)
        values = result.all()
        
        if len(values) > 0:
            count = round((end-start) / cls.gap(start))
            total = sum([v.value for v in values])
            average = total/count if count != 0 else 0
            
            await cls.big_cls.add_live_value(SID, average, start, db)
        else:
            r = RawSql("SELECT value FROM table_value WHERE time < %(start)s AND sensor_SID = %(SID)s ORDER BY time DESC LIMIT 1", {"start": start, "SID": SID})
            res = await r.raw(db)
            if res is None: previous_val = 0
            else: previous_val = res[0]
            await cls.big_cls.add_live_value(SID, previous_val, start, db)


class Value(OwEntity):
    time = Property(int)
    value = Property(float)
    sensor = RTReference(Sensor)
    key = Key(sensor, time)
    
    @classmethod
    async def add_live_value(cls, sensor, value, time, db):
        v = cls(time=time, value=value, sensor=sensor)
        await v.insert(db, replace=True)
        #print("\ntime is", time)
        last_bigger = (await cls.big_cls.last_time(sensor, time, db))
        #print("last_bigger is", last_bigger)
        if last_bigger + cls.big_cls.gap(last_bigger) <= time:
            #print("Let's aggregate some ", cls.big_cls.__name__)
            to_generate = [last_bigger]
            current_time = last_bigger
            while True:
                #try:
                    current_time += cls.big_cls.gap(current_time)
                    if current_time + cls.big_cls.gap(current_time) >= time:
                        break
                    to_generate.append(current_time)
                #except Exception as e:
                    #print(e)
                    ##import pdb; pdb.set_trace()
            #print("Aggregating bigger:", to_generate[0:50], "total", len(to_generate))
            assert all([tg+3600000 < time for tg in to_generate]), str(to_generate)
            for tg in to_generate:
                #print("generating for time", tg)
                await cls.live_aggregate(sensor, tg, db)
                # Here, we need to generate a new HourValue for all Values within [tg, tg+3600000]
                
    
    @classmethod
    async def last_time(cls, sensor, time, db):
        q = RawSql("SELECT time FROM {} WHERE sensor_sid = %(sensor_sid)s ORDER BY time DESC LIMIT 1".format(cls._table_name), {"sensor_sid": sensor})
        t = await q.raw(db)
        # TODO possible optimization (caching)
        # might need some kind of hook by sparrow
        # or just manually override _simple_insert, but that's dirty
        if t is None:
            n = cls.new_time(time)
            return n - cls.gap(n)
        else:
            return t[0] + cls.gap(t[0])
    
    def json_repr(self):
        """format is ``[value, time]`` (to save space)"""
        return [self.value, self.time]
    
    async def is_authorized(self, type, usr, db, **kwargs):
        s = await Sensor.find_by_key(self.sensor).single(db)
        return s.user == usr.key
    
    @classmethod
    async def clean(cls, db):
        now = datetime.now()
        yesterday = datetime(now.year, now.month, now.day) - relativedelta(days=1)
        r = RawSql("DELETE FROM table_value WHERE time < %(time)s",
                   {"time": yesterday.timestamp()*1000})
        await r.exec(db)
    
    
    @classmethod
    async def live_aggregate(cls, SID, hour_start, db):
        hour_end = hour_start + 3600000
        
        r = RawSql("SELECT value, time FROM table_value WHERE %(hour_start)s <= time AND time < %(hour_end)s AND sensor_SID = %(SID)s ORDER BY time ASC",
                    {"hour_start": hour_start, "hour_end": hour_end, "SID": SID})
        res = await r.exec(db)
        values = res.raw_all()
        #print("We got {} values (for query {})".format(len(values), str(r)))
        #print(values)
        #import pdb; pdb.set_trace()
        
        r = RawSql("SELECT value FROM table_value WHERE time < %(start)s AND sensor_SID = %(SID)s ORDER BY time DESC LIMIT 1", {"start": hour_start, "SID": SID})
        res = await r.raw(db)
        if res is None: previous_val = 0
        else: previous_val = res[0]
        #print("Previous value is", previous_val)
        
        # Step 2: Calculate area under (blocky) curve, determine average
        #print("Aggregating hour from {} to {}".format(hour_start, hour_end))
        
        # Step 2a: Get all values that are of importance
        # First determine the first value
        if len(values) > 0:
            if values[0][1] != hour_start:
                assert values[0][1] > hour_start, "Math is officially broken"
                values.insert(0, (previous_val, hour_start))
        
            # Add an extra value for handiness
            values.append((999999, hour_end))
            #print("Hour values:",hour_values)
        
            # Step 2b: determine area's
            hour_sum = 0
            for i, value in enumerate(values[:-1]):
                width = values[i+1][1] - value[1]
                hour_sum += width * value[0]
                #print("hour_sum is now", hour_sum)
            # Step 2c: Insert the HourValue!
            #hv = HourValue(value=hour_sum/3600000, time=hour_start, sensor=SID)
            #await hv.insert(db, replace=True)  # Live!
            await HourValue.add_live_value(SID, hour_sum/3600000, hour_start, db)
            #print(">>>> Adding hour with value", hour_sum/3600000)
        else:
            await HourValue.add_live_value(SID, previous_val, hour_start, db)
            #print(">>>> Adding hour with value", previous_val, " couldn't find any interesting data")
        
    
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
        res = await r.raw(db)
        if res is None: previous_val = 0
        else: previous_val = res[0]
        
        # Step 1: Divide into hours
        start_date = datetime.utcfromtimestamp(actual_start/1000)
        start_date = datetime(start_date.year, start_date.month, start_date.day, start_date.hour)
        start = int(start_date.timestamp()*1000)
        #print("Start", start_date, start)
        
        actual_end = values[-1][1]
        end_date = datetime.utcfromtimestamp(actual_end/1000)
        if end_date.minute == end_date.second == 0:
            end_date = end_date + relativedelta(hours=1)
        else:
            end_date = datetime(end_date.year, end_date.month, end_date.day, end_date.hour) + relativedelta(hours=1)
        end = int(end_date.timestamp()*1000)
        #print("End", end_date, end)
        
        current_index = 0
        for current in range(start, end, 3600000):
            # Step 2: Calculate area under (blocky) curve, determine average
            hour_start = current
            hour_end = current + 3600000
            #print("\nAggregating hour from {} to {}".format(hour_start, hour_end))
            
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
            #print("Hour values:",hour_values)
            
            # Step 2b: determine area's
            hour_sum = 0
            for i, value in enumerate(hour_values[:-1]):
                width = hour_values[i+1][1] - value[1]
                hour_sum += width * value[0]
                #print("hour_sum is now", hour_sum)
            
            # Step 2c: Insert the HourValue!
            hv = HourValue(value=hour_sum/3600000, time=hour_start, sensor=sensor.key)
            await hv._simple_insert(db, replace=True)  # TODO performance?
        
        if recurse:
            hourvalue_times = set(range(start, end, 3600000))
            
            hourvalue_to_day_times = set()
            for t in hourvalue_times: 
                hourvalue_to_day_times.add(DayValue.new_time(t))
                
            dayvalue_to_month_times = set()
            for t in hourvalue_to_day_times: 
                dayvalue_to_month_times.add(MonthValue.new_time(t))
                
            monthvalue_to_year_times = set()
            for t in dayvalue_to_month_times: 
                monthvalue_to_year_times.add(YearValue.new_time(t))
            
            await HourValue.aggregate(sorted(hourvalue_to_day_times), sensor, db)
            await DayValue.aggregate(sorted(dayvalue_to_month_times), sensor, db)
            await MonthValue.aggregate(sorted(monthvalue_to_year_times), sensor, db)


class YearValue(Aggregated, Value):
    @staticmethod
    def aggregate(*args, **kwargs):
        # YOU SHALL NOT PASS!
        pass
        # dangit
    
    @classmethod
    async def add_live_value(cls, sensor, value, time, db):
        v = cls(time=time, value=value, sensor=sensor)
        await v.insert(db, replace=True)
        # This is where it ends...
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.utcfromtimestamp(timestamp/1000)
        assert date.month == date.day == 1
        assert date.hour == date.minute == date.second == 0
        next_year = date + relativedelta(years=1)
        delta = next_year - date
        return delta.total_seconds()*1000
    
    @classmethod
    async def last_time(cls, sensor, time, db):
        q = RawSql("SELECT time FROM {} WHERE sensor_sid = %(sensor_sid)s ORDER BY time DESC LIMIT 1".format(cls._table_name), {"sensor_sid": sensor})
        t = await q.raw(db)
        
        if t is None:
            date = datetime.utcfromtimestamp(time/1000)
            date = datetime(date.year, 1, 1)
            date -= relativedelta(years=1)
            return date.timestamp()*1000
        else:
            return t[0] + cls.gap(t[0])
    
    @staticmethod
    def new_time(old_time):
        old = datetime.utcfromtimestamp(old_time/1000)
        new = datetime(old.year, 1, 1)
        return new.timestamp()*1000


class MonthValue(Aggregated, Value):
    big_cls = YearValue
    
    @classmethod
    async def aggregate(cls_small, times, sensor, db):
        for time in times:
            # Do it differently        
            gap = YearValue.gap(time)
            date = datetime.utcfromtimestamp(time/1000)
            current = date
            weights = []
            for i in range(12):
                result = await cls_small.get(cls_small.sensor == sensor, cls_small.time == current.timestamp()*1000).exec(db)
                if result.count() == 1:
                    mv = result.single()
                    weights.append(mv.value * (cls_small.gap(current.timestamp()*1000) / 86400000))
                else:
                    weights.append(0)
                current += relativedelta(months=1)
            average = sum(weights) / (gap / 86400000)
            
            v = YearValue(value=average, sensor=sensor.key, time=time)
            await v._simple_insert(db, replace=True)
    
    @classmethod
    async def live_aggregate(cls, SID, start, db):
        # The goal is to select all the values we need, determine some average,
        # and insert it, easy.
        gap = cls.big_cls.gap(start)
        end = start + gap
        
        date = datetime.utcfromtimestamp(start/1000)
        current = date
        weights = []
        for i in range(12):
            result = await cls.get(cls.sensor == SID, cls.time == current.timestamp()*1000).exec(db)
            if result.count() == 1:
                mv = result.single()
                days = cls.gap(current.timestamp()*1000)/86400000
                weights.append(mv.value * days)
            else:
                weights.append(0)
            current += relativedelta(months=1)
        average = sum(weights) / (gap / 86400000)
        
        await YearValue.add_live_value(SID, average, start, db)
    
    @classmethod
    async def last_time(cls, sensor, time, db):
        q = RawSql("SELECT time FROM {} WHERE sensor_sid = %(sensor_sid)s ORDER BY time DESC LIMIT 1".format(cls._table_name), {"sensor_sid": sensor})
        t = await q.raw(db)
        
        if t is None:
            date = datetime.utcfromtimestamp(time/1000)
            date = datetime(date.year, date.month, 1)
            date -= relativedelta(months=1)
            assert date.day == 1
            assert date.hour == date.minute == date.second == 0
            return date.timestamp()*1000
        else:
            return t[0] + cls.gap(t[0])
    
    # sigh
    @staticmethod
    def gap(timestamp):
        date = datetime.utcfromtimestamp(timestamp/1000)
        assert date.day == 1
        assert date.hour == date.minute == date.second == 0
        next_month = date + relativedelta(months=1)
        delta = next_month - date
        return delta.total_seconds()*1000
        
    @staticmethod
    def new_time(old_time):
        old = datetime.utcfromtimestamp(old_time/1000)
        new = datetime(old.year, old.month, 1)
        return new.timestamp()*1000


class DayValue(Aggregated, Value):
    big_cls = MonthValue
    gap = staticmethod(lambda t: 1000*60*60*24)
    
    @staticmethod
    def new_time(old_time):
        old = datetime.utcfromtimestamp(old_time/1000)
        new = datetime(old.year, old.month, old.day)
        return new.timestamp()*1000


class HourValue(Aggregated, Value):
    big_cls = DayValue
    gap = staticmethod(lambda t: 1000*60*60)
    
    @staticmethod
    def new_time(old_time):
        old = datetime.utcfromtimestamp(old_time/1000)
        new = datetime(old.year, old.month, old.day, old.hour)
        return new.timestamp()*1000
    
        
        
Value.big_cls = HourValue
