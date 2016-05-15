
import json

from sparrow import *

from .owentity import *

from .sensor import Sensor
from .value import *
from .user import User
from .tag import Tag
from .location import Location

# Dictionary to limit possible fields on which to filter in 'where' clause
value_props_per_type = {}
for cls in Value, HourValue, DayValue, MonthValue, YearValue:
    value_props = {p.name: p for p in cls._props if p.json}
    value_props_per_type[cls.__name__] = (cls, value_props)

sensor_props = {p.name: p for p in Sensor._props if p.json}
location_props = {p.name: p for p in Location._props if p.json}
user_props = {p.name: p for p in User._props if p.json}
tag_props = {p.name: p for p in Tag._props if p.json}


# How to implement convert_to_EUR?
# ================================

# 1. Format
# ---------

# Simple, add a "convert_to_EUR" attribute in the graph definition, true/false.

# 2. How to get the actual cost?
# ------------------------------

# Either calculate on the fly or save it next to it (on the aggregated values).

# If implemented correctly, I think it would be easier to do it on the fly.

# Lets make some things clear first.
# All values don't stand for usage, but rather RATE of usage. Not Joules or kWh, but
# Watts. So, cost will be defined as the amount of EUR you pay for a rate of one unit
# (in Electricity's case, it's W) for ONE HOUR. (Second would be more logical, but 
# rather small numbers. Frontend could provide some handy conversions if needed).

# As an example, if you pay 1 EUR for one kWh, you will pay 0.001 EUR for one Wh, so
# that's what you will have to fill in in EUR_per_unit.

# So, how do we do this? Kinda hard.
# So far, we have relied on Postgres' ability to take averages across values for different
# sensors. However, every sensor may have different EUR_per_unit's set, so we can't do that.
# Either we fetch the values for each sensor apart and do the rest of the math ourselves 
# (i.e. in Python), or we do some fancy subquery shit or so.

# Doing this math will require scaling the value with some factor. It will also be very
# difficult to do with raw values, so let's drop support for that right here and now :).
# So, let's say we have some MonthValue or whatever, with the following data:
#   t = starting time of that value
#   d = duration of that value in seconds ( = MonthValue.gap(t))
#   v = the actual value (i.e. the average power during that period)
#   c = EUR_per_unit
# The value we actually send to the frontend as being the actual value will then be:
#   (d * c/3600) * v
# Pretty simple but it may depend on each value, so good luck with the subquery stuff.

# Anyway, eventually we should get our values which this time are actually the amount
# of EURs that we had to spend during that period.


class Graph(OwEntity):  
    timespan_valuetype_type = Enum("Value", "HourValue", "DayValue", "MonthValue", "YearValue")

    key = GID = KeyProperty()

    timespan_start = Property(int)
    timespan_end = Property(int)
    timespan_valuetype = Property(timespan_valuetype_type)

    title = Property(str)
    
    # TO BE FILLED:
    lines = []
    wheres = []
    cls = None

    filled = False

    async def build(self, base_wheres, group_by, db):
        # base_wheres is a list of WhereInGraphs
        # group_by is still a dictionary
        
        # Tactic: divide all graphs further and further
        # Each list is a limitation aka Where object that filters sensors
        self.cls, _ = value_props_per_type[self.timespan_valuetype]
        self.wheres = base_wheres
        for w in self.wheres:
            w.graph = self.key
        wheres_list = [base_wheres]  # To start, one graph with the basic wheres
        # wheres_list should only contain WhereInGraph or GroupedByInLine stuff
        # both have a get_sql() function that returns something Sparrow understands
        
        for g in group_by:
            extra_wheres = []
            for t in g["IDs"]:
                # Not really a where but anyway
                extra_wheres.append(await create_GroupedByInLine(-1, g["what"], t, db))

            new_where_list = []
            for wheres in wheres_list:
                for w in extra_wheres:
                    new_where_list.append([w]+wheres)
            wheres_list = new_where_list

        self.lines = []
        for wheres in wheres_list:
            actual_wheres = [w.get_sql(db) for w in wheres]
            try:
                sensors = await Sensor.get(*actual_wheres).all(db)
            except:
                import pdb
                pdb.set_trace()
            IDs = [s.SID for s in sensors]
            # TODO give more metadata
            line = Line(graph=self.key, sensors=IDs)
            line.grouped_by = [w for w in wheres if isinstance(w, GroupedByInLine)]
            await line.build(self, db)
            self.lines.append(line)

        self.filled = True


    async def save(self, db):
        await self.insert(db)
        for l in self.lines:
            l.graph = self.key
            await l.save(db)


    async def fill(self, db):
        if not self.filled:
            self.cls, _ = value_props_per_type[self.timespan_valuetype]
            self.lines = await Line.get(Line.graph == self.key).all(db)
            self.wheres =  await WhereInGraph.get(WhereInGraph.graph == self.key).all(db)
            for l in self.lines:
                await l.fill(db)
            self.filled = True

    def json_repr(self):
        assert self.filled, "Fill first"
        return {
            "GID": self.GID,
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

# Following the same convention as other names, this simply means that Graph may contain
# a list of objects like these

# Dictionary which contains frequently used operation codes
op_codes = {'gt': '>', 'lt': '<', 'eq': '=','le': '<=', 'ge': '>=', 'in': 'IN'}

class WhereInGraph(OwEntity):
    op_type = Enum(*op_codes.keys())
    
    graph = Reference(Graph)
    
    key = WIGID = KeyProperty()
    field = Property(str)
    op = Property(op_type)
    
    value_str = Property(str, required=False)
    value_int = Property(int, required=False)
    value_float = Property(float, required=False)
    value_int_array = Property(List(int), required=False)
    
    @property
    def value(self):
        return self.value_str or self.value_int or self.value_float or self.value_int_array
    
    @value.setter
    def value(self, val):
        if isinstance(val, int):
            self.value_int = val
            self.value_float = None
            self.value_str = None
            self.value_int_array = None
        elif isinstance(val, float):
            self.value_int = None
            self.value_float = val
            self.value_str = None
            self.value_int_array = None
        elif isinstance(val, tuple):
            self.value_int = None
            self.value_float = None
            self.value_str = None
            self.value_int_array = val
        else:
            self.value_int = None
            self.value_float = None
            self.value_str = str(val)
    
    def json_repr(self):
        return {
            "field": self.field,
            "op": self.op,
            "value": self.value,
        }
    
    def get_sql(self, *args):
        return Where(sensor_props[self.field].name, op_codes[self.op], Unsafe(self.value))

def create_WhereInGraph(field, op, value, graph=-1):
    w = WhereInGraph(graph=graph, field=field, op=op)
    w.value = value
    return w
    

class Line(OwEntity):
    # grouped_by = TODO
    key = LID = KeyProperty()
    graph = Reference(Graph)
    sensors = Property(List(int))

    # TO BE FILLED
    values = []  # tuples (value, time)
    grouped_by = []
    
    filled = False

    async def build(self, graph, db):
        if len(self.sensors) == 0:
            self.values = []
        else:
            req = RawSql("SELECT avg(value), time AS value FROM {g.cls._table_name} WHERE sensor_SID IN {sensors} GROUP BY time HAVING time >= %(start)s AND time < %(end)s ORDER BY time".format(s=self, g=graph, sensors="("+str(self.sensors[0])+")" if len(self.sensors) == 1 else str(tuple(self.sensors))), {
                "start": graph.timespan_start,
                "end": graph.timespan_end,
            })
            result = await req.exec(db)
            self.values = result.raw_all()
        for g in self.grouped_by:
            await g.fill(db)
        self.filled = True

    async def save(self, db):
        await self.insert(db)
        for v in self.values:
            await DataInLine(line=self.key, time=v[1], value=v[0]).insert(db)
        for gb in self.grouped_by:
            gb.line = self.key
            await gb.insert(db)
    
    async def fill(self, db):
        if not self.filled:
            data = await DataInLine.get(DataInLine.line == self.key).all(db)
            self.values = [(d.value, d.time) for d in data]
            self.grouped_by = await GroupedByInLine.get(GroupedByInLine.line == self.key).all(db)
            for g in self.grouped_by:
                await g.fill(db)
            self.filled = True

    def json_repr(self):
        assert self.filled, "Not filled"
        
        return {
            "grouped_by": [gb.json_repr() for gb in self.grouped_by],
            "sensors": self.sensors,
            "values": [list(v) for v in self.values],
            "label": ", ".join(["{g.what}: {g.name}".format(g=g) for g in self.grouped_by])
        }

    
from util.switch import switch, case

class GroupedByInLine(OwEntity):
    key = GBID = KeyProperty()
    line = Reference(Line)
    what = Property(str)
    ref_ID = Property(int)  # If it needs to be something else, bad luck
                            # In the case of what == "Type" the integer here refers to 
    
    # TO BE FILLED
    name = "unnamed"
    
    async def fill(self, db):
        self.name = await self.get_name(self, db)
    
    class get_ID(switch):
        select = lambda self: self.what
        
        _type = case("Type")(lambda self: {"ID": Sensor.type.type.options[self.ref_ID]})
        _tag = case("Tag")(lambda self: {"TID": self.ref_ID} if self.ref_ID != -1 else {"TID": "$NOTAGS$"})
        _loc = case("Location")(lambda self: {"LID": self.ref_ID})
        _sensor = case("Sensor")(lambda self: {"SID": self.ref_ID})
        _user = case("User")(lambda self: {"UID": self.ref_ID}) 
    
    class get_name(switch):
        select = lambda self, db: self.what
        
        @case("Type")
        async def _type(self, db):
            return Sensor.type.type.options[self.ref_ID]
        
        @case("Tag")
        async def _tag(self, db):
            if self.ref_ID == -1:
                return "no tags"
            obj = await Tag.find_by_key(self.ref_ID, db)
            return obj.description
        
        @case("Location")
        async def _location(self, db):
            obj = await Location.find_by_key(self.ref_ID, db)
            return obj.description
        
        @case("Sensor")
        async def _sensor(self, db):
            obj = await Sensor.find_by_key(self.ref_ID, db)
            return obj.title
        
        @case("User")
        async def _user(self, db):
            obj = await User.find_by_key(self.ref_ID, db)
            return obj.first_name + " " + obj.last_name
    
    
    def json_repr(self):
        base = {"what": self.what}
        base.update(self.get_ID(self))
        return base
    
    class _get_sql(switch):
        select = lambda self, db: self.what
        
        @case("Type")
        def _type(self, db):
            return Where(Sensor.type, "=", "'%s'"%Sensor.type.type.options[self.ref_ID])
        
        @case("Tag")
        def _tag(self, db):
            if self.ref_ID == -1:  # == no tag
                return RawSql("table_Sensor.SID NOT IN (SELECT table_Tagged.sensor_sid FROM table_Tagged)")
            else:
                return RawSql("table_Sensor.SID IN (SELECT table_Tagged.sensor_sid FROM table_Tagged WHERE table_Tagged.tag_tid = %(tag_ID)s)", {"tag_ID": self.ref_ID})
        
        @case("Location")
        def _location(self, db):
            return Where(Sensor.location_LID, "=", Unsafe(self.ref_ID))
        
        @case("Sensor")
        def _sensor(self, db):
            return Where(Sensor.SID, "=", Unsafe(self.ref_ID))
        
        @case("User")
        def _user(self, db):
            return Where(Sensor.user_UID, "=", Unsafe(self.ref_ID))
    
    def get_sql(self, db):
        return self._get_sql(self, db)
    
async def create_GroupedByInLine(line, what, value, db):
    if not isinstance(value, int):
        if what == "Type":
            value = Sensor.type.type.inv_options[value]
        elif what == "Tag":
            assert value == "$NOTAGS$"
            value = -1
    g = GroupedByInLine(line=line, what=what, ref_ID=value)
    await g.fill(db)
    return g

class DataInLine(OwEntity):
    line = Reference(Line)
    time = Property(int)
    value = Property(float)
    key = Key(line, time)

