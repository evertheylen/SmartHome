
import weakref
from functools import wraps

from tornado.testing import *

from overwatch import *
from util.mock import Mock

config = default_config
config["tornado_app_settings"]["autoreload"] = False
config["database"]["dbname"] = "testdb"

class OverWatchTest(AsyncHTTPTestCase, LogTrapTestCase):
    def patch(self):
        pass

    def setUp(self):
        super(OverWatchTest, self).setUp()

    def get_app(self):
        self.ow = OverWatch(config, self.io_loop)
        self.db = self.ow.model.db  # shortcut
        self.patch()
        return self.ow.app

    def to_insert(self):
        # function, so the references go away and the cache is empty
        return []


def ow_test(method):
    @gen_test
    @wraps(method)
    async def wrapper(self):
        await self.ow.reinstall()
        for ent in self.to_insert():
            await ent.insert(self.ow.model.db)
        for cls in self.ow.model.classes:
            cls.cache = weakref.WeakValueDictionary()  # replace the old cache entirely
        await method(self)
    return wrapper


class SimpleAdd(OverWatchTest):
    def to_insert(self):
        return [
            # Users
            model.User(first_name="Evert", last_name="Heylen", email="e@e", password="testtest"),
            model.User(first_name="Anthony", last_name="Hermans", email="a@a", password="seeecret")
        ]

    @ow_test
    async def test_users(self):
        e = await model.User.find_by_key(1, self.db)
        a = await model.User.find_by_key(2, self.db)
        self.assertEqual(e.first_name, "Evert")
        self.assertEqual(a.first_name, "Anthony")

class SimpleEdit(OverWatchTest):
    def to_insert(self):
        return [
            # Users
            model.User(first_name="Anthony", last_name="Hermans", email="a@a", password="seeecret"),
            model.Location(user=1, description="Location 1", number=4, street="Bist", city="Lier", postalcode=2000, country="Belgium", elec_price=12.45),
            model.Sensor(type="Electricity", title="Measure shit 1", user= 1, location=1)
        ]

    @ow_test
    async def test_edit(self):
        a = await model.User.find_by_key(1, self.db)
        l = await model.Location.find_by_key(1, self.db)
        s = await model.Sensor.find_by_key(1, self.db)
        self.assertEqual(a.first_name, "Anthony")
        self.assertEqual(l.user, 1)
        self.assertEqual(s.type, "Electricity")
        s.edit_from_json({"type": "Fire", "title": "Measure more shit 2", "user_UID": 1, "location_LID": 1})
        await s.update(self.db)
        self.assertEqual(s.type, "Fire")
        self.assertEqual(s.title, "Measure more shit 2")
