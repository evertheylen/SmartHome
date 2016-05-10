
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
            await self.ow.controller.insert_csv_file(body, False)
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
            await self.ow.controller.insert_csv_file(body, False)
            rawvals = await Value.get().all(self.ow.model.db)
            hourvals = await HourValue.get().all(self.ow.model.db)
            dayvals = await DayValue.get().all(self.ow.model.db)
            monthvals = await MonthValue.get().all(self.ow.model.db)
            yearvals = await YearValue.get().all(self.ow.model.db)
            
            raw_average = sum([v.value for v in rawvals]) / len(rawvals)
            self.assertTrue(almost_equal(raw_average, 5.0))  # All filled
            hour_average = sum([v.value for v in hourvals]) / len(hourvals)            
            self.assertTrue(almost_equal(hour_average, 5.0))  # All filled
            day_average = sum([v.value for v in dayvals]) / len(dayvals)
            self.assertTrue(almost_equal(day_average, 5.0)) # All filled
            month_average = sum([v.value for v in monthvals]) / len(monthvals)
            self.assertTrue(almost_equal(month_average, 5*(9/30)))  # Only 9 days filled (see above)
            year_average = sum([v.value for v in yearvals]) / len(yearvals)
            self.assertTrue(almost_equal(year_average, (5*(9/30))/12))  # Only 1 month filled




