
from testing.base import *
from model import *

class SimpleGraph(OverWatchTest):
    def to_insert(self):
        return basic_insert()
    
    async def prepare(self):
        with open("data/data_house_1_ALLFIVE.csv", "rb") as f:
            body = f.read()
            await self.ow.controller.insert_csv_file(body, False)
        self.user = (await User.get().all(self.ow.model.db))[0]
        self.conn = MockConn(self.user)
    
    def send(self, dct):
        return self.ow.controller.handle_request(wshandler.Request(self.conn, 0xDEADBEEF, dct))
    
    def resp(self):
        return self.conn.received_messages[-1]
    
    async def create_graph(self, graph_dct):
        await self.send(graph_dct)
        # Note: creating a very big graph is actually quite a costly operation
        # Before I tried to insert all the values, and apparently it took longer than 5s
        # which caused Tornado to throw a timeout exception...
        tempID = self.resp()["data"]["GID"]
        await self.send({
            "type": "add",
            "what": "Graph",
            "data": {"GID": tempID},
            })
        ID = self.resp()["data"]["GID"]
        await self.send({
            "type": "get",
            "what": "Graph",
            "data": {"GID": ID}
            })
    
    @ow_test
    async def test_group_by_location(self):
        await self.create_graph({
            "type": "create_graph",
            "timespan": {"valueType": "Value", "start": 1463698800, "end": 1463700000},
            "group_by": [{"what": "Location", "IDs": [1]}],
            "where": [],
        })
        self.assertEqual(self.resp()["data"]["lines"][0]["grouped_by"], [{"what": "Location", "LID": 1}])
    
    @ow_test
    async def test_group_by_user(self):
        await self.create_graph({
            "type": "create_graph",
            "timespan": {"valueType": "Value", "start": 1463698800, "end": 1463700000},
            "group_by": [{"what": "User", "IDs": [1]}],
            "where": [],
        })
        self.assertEqual(self.resp()["data"]["lines"][0]["grouped_by"], [{"what": "User", "UID": 1}])
