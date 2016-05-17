
from itertools import chain
import time
now = lambda: round(time.time()*1000)

import tornado.ioloop
from sparrow import *

from .owentity import *
from .graph import *
from .user import User

ioloop = tornado.ioloop.IOLoop.instance()

some_global_graph = None

class LiveGraph(RTOwEntity):
    key = LGID = KeyProperty()
    
    timespan_start = Property(int)
    timespan_end = Property(int)
    timespan_valuetype = Property(Graph.timespan_valuetype_type)
    
    title = Property(str)
    
    user = Reference(User)
    
    # TO BE FILLED:
    lines = []
    wheres = []
    cls = None
    
    filled = False
    
    async def build(self, base_wheres, group_by, db):
        global some_global_graph
        some_global_graph = self
        # base_wheres is a list of WhereInGraphs
        # group_by is still a dictionary
        
        self.cls, _ = value_props_per_type[self.timespan_valuetype]
        self.wheres = base_wheres
        for w in self.wheres:
            w.graph = self.key
        wheres_list = [base_wheres]
        
        for g in group_by:
            extra_wheres = []
            for t in g["IDs"]:
                # Not really a where but anyway
                extra_wheres.append(await create_GroupedByInLineLive(-1, g["what"], t, db))

            new_where_list = []
            for wheres in wheres_list:
                for w in extra_wheres:
                    new_where_list.append([w]+wheres)
            wheres_list = new_where_list

        self.lines = []
        for i, wheres in enumerate(wheres_list):
            actual_wheres = [w.get_sql(db) for w in wheres]
            sensors = await Sensor.get(*actual_wheres).all(db)
            IDs = [s.SID for s in sensors]
            line = LiveLine(graph=self.key, sensors=IDs)
            line.grouped_by = [w for w in wheres if isinstance(w, GroupedByInLineLive)]
            await line.build(self, i, sensors, db)
            self.lines.append(line)

        self.filled = True
    
    async def save(self, db):
        await self.insert(db)
        for l in self.lines:
            l.graph = self.key
            await l.save(db)
    
    def set_key(self, SID):
        self.SID = SID
        for l in self.lines:
            l.graph = SID
        for w in self.wheres:
            w.graph = SID
    
    async def fill(self, db):
        if not self.filled:
            self.filled = True
            self.cls, _ = value_props_per_type[self.timespan_valuetype]
            self.lines = await LiveLine.get(LiveLine.graph == self.key).all(db)
            self.wheres =  await WhereInGraphLive.get(WhereInGraphLive.graph == self.key).all(db)
            for l in self.lines:
                await l.fill(db)
    
    def json_repr(self):
        assert self.filled, "Fill first"
        return {
            "LGID": self.LGID,
            "group_by": [],
            "where": [w.json_repr() for w in self.wheres],
            "title": self.title,
            "lines": [l.json_repr() for l in self.lines],
            #"convert_to_EUR": self.convert_to_EUR,
            "timespan": {
                "start": self.timespan_start,
                "end": self.timespan_end,
                "valueType": self.timespan_valuetype
            }
        }


class WhereInGraphLive(WhereInGraph):
    graph = Reference(LiveGraph)

def create_WhereInGraphLive(field, op, value, graph=-1):
    w = WhereInGraphLive(graph=graph, field=field, op=op)
    w.value = value
    return w


class LiveLine(RTOwEntity, Listener):
    key = LLID = KeyProperty()
    graph = Reference(LiveGraph)
    sensors = Property(List(int))

    # TO BE FILLED
    grouped_by = []
    actual_graph = None
    actual_sensors = []
    
    filled = False
    
    # Lives as long as the object itself:
    values = []
    # The buffer will contain for each sensor the values it has sent
    buffer = {}
    
    sensors_listening = set()
    conns_listening = set()
    
    async def build(self, graph, num, sensors, db):
        self.LLID = num
        for g in self.grouped_by:
            await g.fill(db)
        self.filled = True
        self.actual_graph = graph
        self.actual_sensors = sensors
        await self.second_fill(db)
    
    async def save(self, db):
        await self.insert(db)
        for gb in self.grouped_by:
            gb.line = self.key
            await gb.insert(db)
    
    async def fill(self, db):
        if not self.filled:
            print("AM I GETTING FILLED EVEN?")
            self.filled = True
            
            self.grouped_by = await GroupedByInLineLive.get(GroupedByInLineLive.line == self.key).all(db)
            for g in self.grouped_by:
                await g.fill(db)
            self.actual_graph = await LiveGraph.find_by_key(self.graph, db)
            await self.actual_graph.fill(db)
            
            # Each time we are initialized, we recheck the sensors
            graph_wheres = await WhereInGraphLive.get(WhereInGraphLive.graph == self.graph).all(db)
            actual_wheres = [w.get_sql(db) for w in chain(graph_wheres, self.grouped_by)]
            self.actual_sensors = await Sensor.get(*actual_wheres).all(db)
            print("actual sensors of line", self.actual_sensors)
            IDs = [s.SID for s in self.actual_sensors]
            if set(IDs) != set(self.sensors):
                print("LiveLine found different sensors: ", IDs)
                self.sensors = IDs
                await self.update(db)
            await self.second_fill(db)
    
    async def second_fill(self, db):
        if len(self.sensors) > 0:
            cls = self.actual_graph.cls
            r = RawSql("SELECT avg(value), time FROM {cls._table_name} WHERE sensor_SID IN {sensors} GROUP BY time HAVING time >= %(start)s ORDER BY time".format(cls=cls, sensors="("+str(self.sensors[0])+")" if len(self.sensors) == 1 else str(tuple(self.sensors))), {"start": now() + self.actual_graph.timespan_start})
            result = await r.exec(db)
            self.values = result.raw_all()
            for s in self.actual_sensors:
                s.add_listener(self)
        else:
            print("No sensors found")
    
    def json_repr(self):
        assert self.filled, "Not filled"
        
        return {
            "LLID": self.LLID,
            "grouped_by": [gb.json_repr() for gb in self.grouped_by],
            "sensors": self.sensors,
            "label": ", ".join(["{g.what}: {g.name}".format(g=g) for g in self.grouped_by])
        }
    
    def json_value_repr(self):
        assert self.filled, "Not filled"
        
        return {
            "LLID": self.LLID,
            "values": [list(v) for v in self.values],
        }
    
    def register_conn(self, conn):
        self.conns_listening.add(conn)
        print("REGISTERED A CONNECTION YAY (currently {} conns)".format(len(self.conns_listening)))
        
    
    def unregister_conn(self, conn):
        print("BYE BYE CONNECTION")
        self.conns_listening.remove(conn)
        
    
    async def send_add(self, values):
        for c in self.conns_listening:
            await c.send({
                "type": "live_add_liveline_values",
                "graph": self.graph,
                "line": self.key,
                "values": [list(t) for t in values],
            })
    
    async def send_delete(self, values):
        for c in self.conns_listening:
            await c.send({
                "type": "live_delete_liveline_values",
                "graph": self.graph,
                "line": self.key,
                "values": [list(t) for t in values],
            })
        
    # Listener interface
    
    def _add_listenee(self, obj):
        self.sensors_listening.add(obj)
    
    def _remove_listenee(self, obj):
        self.sensors_listening.remove(obj)
    
    def new_reference(self, sensor, value):
        print("I GOT A VALUE NICE")
        if type(value) is self.actual_graph.cls:
            # Add it to the buffer!
            assert sensor.SID in self.sensors
            if sensor.SID not in self.buffer:
                print("New value!")
                self.buffer[sensor.SID] = [(value.value, value.time)]
                # Check if the buffer is full
                if len(self.buffer) == len(self.sensors):
                    print("Full buffer!")
                    s = self.sum_and_clear_buffer()
                    self.values.append(s)
                    ioloop.spawn_callback(self.send_add, [s])
                    # Clean up values
                    start = now() + self.actual_graph.timespan_start()
                    todelete = []
                    for v in self.values:
                        if v[1] < start:
                            todelete.append(v)
                    for v in todelete:
                        self.values.remove(v)
                    print("Removed {} values".format(len(todelete)))
                    ioloop.spawn_callback(self.send_delete, [todelete])
            else:
                print("Already has a value, but we'll add it anyways")
                self.buffer[sensor.SID].append((value.value, value.time))
        else:
            print("got wrong type")
    
    def sum_and_clear_buffer(self):
        sensor_vals = []
        for (s, vals) in self.buffer.items():
            val_avg = sum([v[0] for v in vals])/len(vals)
            time_avg = sum([v[1] for v in vals])/len(vals)
            sensor_vals.append((val_avg, time_avg))
        val_avg = sum([v[0] for v in sensor_vals])/len(sensor_vals)
        time_avg = sum([v[1] for v in sensor_vals])/len(sensor_vals)
        total_val = (val_avg, time_avg)
        self.buffer = {}
        return total_val
        

class GroupedByInLineLive(GroupedByInLine):
    line = Reference(LiveLine)

async def create_GroupedByInLineLive(line, what, value, db):
    if not isinstance(value, int):
        if what == "Type":
            value = Sensor.type.type.inv_options[value]
        elif what == "Tag":
            assert value == "$NOTAGS$"
            value = -1
    g = GroupedByInLineLive(line=line, what=what, ref_ID=value)
    await g.fill(db)
    return g
