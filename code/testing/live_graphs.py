
from testing.base import *
from model import *

from .graphs import BaseGraph

class BaseLiveGraph(BaseGraph):
    datafile = "data/data_house_1_ALLFIVE.csv"
    
    async def create_graph(self, graph_dct):
        await self.send(graph_dct)
        # Note: creating a very big graph is actually quite a costly operation
        # Before I tried to insert all the values, and apparently it took longer than 5s
        # which caused Tornado to throw a timeout exception...
        tempID = self.resp()["data"]["GID"]
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

