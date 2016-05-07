
from tornado.testing import *
from tornado.httpclient import *

import util

from testing.base import *


class SimpleTests(AsyncTestCase):
    # async example
    @gen_test
    async def test_blah(self):
        client = AsyncHTTPClient(self.io_loop)
        response = await client.fetch("http://tornadoweb.org")
        self.assertIn("FriendFeed", str(response.body))

    def test_blaa(self):
        self.assertEqual(5, 3+2)
    
    def test_util(self):
        e = util.Error("short", "long")
        self.assertEqual(e.json_repr(), {"short": "short", "long": "long"})
    
