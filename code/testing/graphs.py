
from testing.base import *
from model import *

class BaseGraph(OverWatchTest):
    def to_insert(self):
        return basic_insert()
    
    datafile = "data/data_house_1_ALLFIVE.csv"
    
    async def prepare(self):
        with open(self.datafile, "rb") as f:
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

class SimpleGraph(BaseGraph):
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


class AdvancedGraph(BaseGraph):
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
            Sensor(type="electricity", title="Test", user=1, location=1, EUR_per_unit=10),
            Sensor(type="gas", title="Test two", user=1, location=1, EUR_per_unit=10),
            Sensor(type="electricity", title="Test three", user=1, location=1, EUR_per_unit=10),
            
            # Tags
            Tag(description="room1"),
            
            # Tagged
            Tagged(sensor=1, tag=1),
            Tagged(sensor=2, tag=1),
        ]

    @ow_test
    async def test_group_by_tag_and_where(self):
        await self.create_graph({
            "type": "create_graph",
            "timespan": {"valueType": "Value", "start": 1463698800, "end": 1463700000},
            "group_by": [{"what": "Tag", "IDs": ["$NOTAGS$", 1]}],
            "where": [{"field": "SID", "op": "in", "value": [1, 3]}],
        })
        print(self.resp())
        #self.assertEqual(self.resp()["data"]["lines"][0]["grouped_by"], [{"what": "User", "UID": 1}])
