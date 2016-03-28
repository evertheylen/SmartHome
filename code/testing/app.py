
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

