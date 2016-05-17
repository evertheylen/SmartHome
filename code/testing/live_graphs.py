
import time
now = lambda: round(time.time()*1000)

import tornado

from testing.base import *
from model import *
from testing.graphs import BaseGraph

class BaseLiveGraph(BaseGraph):
    datafile = None
    
    async def create_graph(self, graph_dct):
        await self.send(graph_dct)
        # Note: creating a very big graph is actually quite a costly operation
        # Before I tried to insert all the values, and apparently it took longer than 5s
        # which caused Tornado to throw a timeout exception...
        tempID = self.resp()["data"]["LGID"]
        await self.send({
            "type": "add",
            "what": "LiveGraph",
            "data": {"LGID": tempID},
            })
        ID = self.resp()["data"]["LGID"]
        await self.send({
            "type": "get",
            "what": "LiveGraph",
            "data": {"LGID": ID}
        })
        # TODO get livelines

    
    @ow_test
    async def test_simple_graph(self):
        await Value.add_live_value(1, 3.1415, now()-40000, self.ow.model.db)
        await Value.add_live_value(1, 6.2830, now()-20000, self.ow.model.db)
        await self.create_graph({
            "type": "create_live_graph",
            "timespan": {"valueType": "DayValue", "start": -3600000, "end": 0}, # 5 days
            "group_by": [{"what": "User", "IDs": [1]}],
            "where": [],
        })
        ID = self.resp()["data"]["LGID"]
        await self.send({
            "type": "get_liveline_values",
            "graph": ID
        })
        print(self.resp())

