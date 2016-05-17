
import time
now = lambda: round(time.time()*1000)

import tornado.gen

from testing.base import *
from model import *

def almost_equal(a, b, rel_error=0.05):
    maximum = max(a,b)
    diff = abs(a-b)
    return diff <= rel_error*maximum


class Aggregate(OverWatchTest):
    def to_insert(self):
        return basic_insert()

    @ow_test
    async def test_count(self):
        with open("data/data_house_1_TESTING.csv", "rb") as f:
            body = f.read()
            await self.ow.controller.insert_csv_file(body)
        rawvals = await Value.get().all(self.ow.model.db)
        hourvals = await HourValue.get().all(self.ow.model.db)
        dayvals = await DayValue.get().all(self.ow.model.db)
        monthvals = await MonthValue.get().all(self.ow.model.db)
        yearvals = await YearValue.get().all(self.ow.model.db)
        self.assertEqual(len(rawvals), 896)
        self.assertEqual(len(hourvals), 216)
        self.assertEqual(len(dayvals), 9)
        self.assertEqual(len(monthvals), 1)
        self.assertEqual(len(yearvals), 1)

    @ow_test
    async def test_allfive(self):
        with open("data/data_house_1_ALLFIVE.csv", "rb") as f:
            # Same file as above, but all values are around 5.0
            # Counts are also the same (except for the raw values)
            body = f.read()
            await self.ow.controller.insert_csv_file(body)
        rawvals = await Value.get().all(self.ow.model.db)
        hourvals = await HourValue.get().all(self.ow.model.db)
        dayvals = await DayValue.get().all(self.ow.model.db)
        monthvals = await MonthValue.get().all(self.ow.model.db)
        yearvals = await YearValue.get().all(self.ow.model.db)
        
        raw_average = sum([v.value for v in rawvals]) / len(rawvals)
        hour_average = sum([v.value for v in hourvals]) / len(hourvals)
        day_average = sum([v.value for v in dayvals]) / len(dayvals)
        month_average = sum([v.value for v in monthvals]) / len(monthvals)
        year_average = sum([v.value for v in yearvals]) / len(yearvals)
        #print(raw_average, hour_average, day_average, month_average, year_average)
        self.assertTrue(almost_equal(raw_average, 5.0))  # All filled
        self.assertTrue(almost_equal(hour_average, 5.0))  # All filled
        self.assertTrue(almost_equal(day_average, 5.0)) # All filled
        self.assertTrue(almost_equal(month_average, 5*(9/30)))  # Only 9 days filled (see above)
        self.assertTrue(almost_equal(year_average, (5*(9/30))/12))  # Only 1 month filled
            
    @ow_test
    async def test_live_add_empty_hour(self):
        print("now is", now())
        v = HourValue(time = HourValue.new_time(now()-3600000*2), value=3.14156535, sensor=1)
        await v.insert(self.ow.model.db)
        await self.ow.controller.add_live_value(1, "notsosecret", 5.1)
        hourvals = await HourValue.get().all(self.ow.model.db)
        self.assertEqual(len(hourvals), 2)
    
    @ow_test
    async def test_live_add_lots(self):
        n = now()
        for i, t in enumerate(range(n, n+7894123, 21567)):
            #print("adding for time", t)
            await Value.add_live_value(1, 3.14156535, t, self.ow.model.db)
        hourvals = await HourValue.get().all(self.ow.model.db)
        self.assertTrue(almost_equal(hourvals[-1].value, 3.14156535))
    
    @ow_test
    async def long_test_live_add_long_periods(self):
        n = now()
        print("now is", n)
        period = 1000*60*60*24*25 + 1234500
        for i, t in enumerate(range(n, n+(period*100), period)):
            #print("adding for time", t)
            await Value.add_live_value(1, 3.14156535, t, self.ow.model.db)
        # After running this for a minute you just kinda check the database yourself :)
        
    
    

