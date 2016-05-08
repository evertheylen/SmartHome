
from testing.base import *
import tornado.gen

from model import *

class Aggregate(OverWatchTest):
    def to_insert(self):
        return [
            # Wall: without a wall a user cant be initialized
            Wall(is_user=True),
            # Users
            User(first_name="Evert", last_name="Heylen", email="e@e",
                       password="$2a$13$2yGuYSME6BTKp.uhuXjT1.1WgLWDBYnWpwiStaroy0Km6vXweNkvu",
                       wall=1, admin=True),
            # Locations
            Location(description="Home", number=100, street="some street", city="Some city",
                           postalcode=1000, country="Belgium", user=1),
            # Sensors
            Sensor(type="electricity", title="Test", user=1, location=1, EUR_per_unit=12.5)
        ]

    @ow_test
    async def test_aggregates(self):
        with open("data/data_house_1_TESTING.csv", "rb") as f:
            body = f.read()
            await self.ow.controller.insert_csv_file(body, False)
            rawvals = await Value.get().all(self.ow.model.db)
            hourvals = await HourValue.get().all(self.ow.model.db)
            dayvals = await DayValue.get().all(self.ow.model.db)
            monthvals = await MonthValue.get().all(self.ow.model.db)
            yearvals = await YearValue.get().all(self.ow.model.db)
            self.assertEqual(len(rawvals), 895)
            self.assertEqual(len(hourvals), 216)
            self.assertEqual(len(dayvals), 9)
            self.assertEqual(len(monthvals), 1)
            self.assertEqual(len(yearvals), 1)
            
            # we compare the hourly average for each one
            hour_average = sum([v.value for v in hourvals]) / len(hourvals)
            
            day_average = sum([v.value for v in dayvals]) / len(dayvals)
            self.assertAlmostEqual(hour_average, day_average)
            month_average = sum([v.value for v in monthvals]) / len(monthvals)
            self.assertAlmostEqual(hour_average, month_average)
            year_average = sum([v.value for v in yearvals]) / len(yearvals)
            self.assertAlmostEqual(hour_average, year_average)


