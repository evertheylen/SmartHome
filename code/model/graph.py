
import json

from sparrow import *

from .owentity import *

from .sensor import Sensor
from .value import *
from .user import User

# Dictionary to limit possible fields on which to filter in 'where' clause
value_props_per_type = {}
for cls in Value, HourValue, DayValue, MonthValue, YearValue:
    value_props = {p.name: p for p in cls._props if p.json}
    value_props_per_type[cls.__name__] = (cls, value_props)

sensor_props = {p.name: p for p in Sensor._props if p.json}


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
# Pretty simple but it may depend on each value, so good luck with the subquery shit.

# Anyway, eventually we should get our values which this time are actually the amount
# of EURs that we had to spend during that period.


class Graph(OwEntity):  
    timespan_valuetype_type = Enum("Value", "HourValue", "DayValue", "MonthValue", "YearValue")
    
    key = GID = KeyProperty()
    
    timespan_start = Property(int)
    timespan_end = Property(int)
    timespan_valuetype = Property(timespan_valuetype_type)
    
    title = Property(str)
    
    # Let's just save those as text and be done with it
    where_text = Property(str)
    
    #convert_to_EUR = Property(bool)
    
    # TO BE FILLED:
    lines = []
    cls = None
    
    filled = False
    
    async def build(self, base_wheres, group_by, db):
        # Tactic: divide all graphs further and further
        # Each list is a limitation aka Where object that filters sensors
        self.cls, _ = value_props_per_type[self.timespan_valuetype]
        wheres_list = [base_wheres]  # To start, one graph with the basic wheres
        for g in group_by:
            extra_wheres = []
            if g["what"] == "Sensor":
                for SID in g["IDs"]:
                    extra_wheres.append(new_GroupedByInLine(-1, "Sensor", SID, Sensor.SID == SID))
            elif g["what"] == "User":
                for UID in g["IDs"]:
                    extra_wheres.append(new_GroupedByInLine(-1, "User", UID, Sensor.user == UID))
            elif g["what"] == "Type":
               for t in g["IDs"]:
                   if t not in Sensor.type_type.options:
                       raise Error("unknown_type", "Unknown type")
                   extra_wheres.append(new_GroupedByInLine(-1, "Sensor", SID, Sensor.type == "'%s'"%t))
            elif g["what"] == "Tag":
                # TODO does not work when subquery has more than one row
                # TODO support for the magic value "$NOTAGS$"
                for t in g["IDs"]:
                    # Not really a where but anyway
                    extra_wheres.append(new_GroupedByInLine(-1, "Tag", t, RawSql("SELECT * FROM table_sensor WHERE table_sensor.SID IN (SELECT table_tag.sensor_SID FROM table_Tag WHERE text = %(tagtext)s)", {"tagtext": t})))
            elif g["what"] == "Location":
                for LID in g["IDs"]:
                    extra_wheres.append(new_GroupedByInLine(-1, "Location", LID, Sensor.location == LID))
            else:
                raise Error("no_such_group_by", "There is no such group_by 'what' attribute")

            new_where_list = []
            for wheres in wheres_list:
                for w in extra_wheres:
                    new_where_list.append([w]+wheres)
            wheres_list = new_where_list

        self.lines = []
        for wheres in wheres_list:
            actual_wheres = [getattr(w, "actual_where", w) for w in wheres]
            sensors = await Sensor.get(*actual_wheres).all(db)
            IDs = [s.SID for s in sensors]
            # TODO give more metadata
            line = Line(graph=self.key)
            line.grouped_by = wheres
            await line.build(IDs, self, db)
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
            for l in self.lines:
                await l.fill(db)
            self.filled = True
    
    def json_repr(self):
        assert self.filled, "Fill first"
        return {
            "GID": self.GID,
            "group_by": [],
            "where": [],
            "title": self.title,
            "lines": [l.json_repr() for l in self.lines],
            #"convert_to_EUR": self.convert_to_EUR,
            "timespan": {
                "start": self.timespan_start,
                "end": self.timespan_end,
                "valueType": self.timespan_valuetype
            }
        }

    
    
            
class Line(OwEntity):
    # grouped_by = TODO
    key = LID = KeyProperty()
    graph = Reference(Graph)
    
    # TO BE FILLED
    values = []  # tuples (value, time)
    sensors = [] # simple ID's
    grouped_by = []
    
    filled = False
    
    async def build(self, sensors, graph, db):
        self.sensors = sensors
        if len(self.sensors) == 0:
            self.values = []
        else:
            req = RawSql("SELECT avg(value), time AS value FROM {g.cls._table_name} WHERE sensor_SID IN {sensors} GROUP BY time HAVING time >= %(start)s AND time < %(end)s ORDER BY time".format(s=self, g=graph, sensors="("+str(self.sensors[0])+")" if len(self.sensors) == 1 else str(tuple(self.sensors))), {
                "start": graph.timespan_start,
                "end": graph.timespan_end,
            })
            result = await req.exec(db)
            self.values = result.raw_all()
        self.filled = True
    
    async def save(self, db):
        await self.insert(db)
        for v in self.values:
            await DataInLine(line=self.key, time=v[1], value=v[0]).insert(db)
        for s in self.sensors:
            await SensorsInLine(line=self.key, sensor=s).insert(db)
        for gb in self.grouped_by:
            gb.line = self.key
            await gb.insert(db)
    
    async def fill(self, db):
        if not self.filled:
            data = await DataInLine.get(DataInLine.line == self.key).all(db)
            self.values = [(d.value, d.time) for d in data]
            sil = await SensorsInLine.get(SensorsInLine.line == self.key).all(db)
            self.sensors = [s.sensor_SID for s in sil]
            self.grouped_by = await GroupedByInLine.get(GroupedByInLine.line == self.key).all(db)
            self.filled = True
    
    def json_repr(self):
        assert self.filled, "Not filled"
        return {
            "grouped_by": [gb.json_repr() for gb in self.grouped_by],
            "sensors": self.sensors,
            "values": [list(v) for v in self.values]
        }

    
from util.switch import switch, case

class GroupedByInLine(OwEntity):
    key = GBID = KeyProperty()
    line = Reference(Line)
    what = Property(str)
    ref_ID = Property(int)  # If it needs to be something else, bad luck
                            # In the case of what == "Type" the integer here refers to 
    
    actual_where = None
    
    class get_ID(switch):
        select = lambda self: self.what
        
        _type = case("Type")(lambda self: {"ID": Sensor.type.type.options[self.ref_ID]})
        _tag = case("Tag")(lambda self: {"TID": self.ref_ID})
        _loc = case("Location")(lambda self: {"LID": self.ref_ID})
        _sensor = case("Sensor")(lambda self: {"SID": self.ref_ID})
        _user = case("User")(lambda self: {"UID": self.ref_ID}) 
    
    def json_repr(self):
        base = {"what": self.what}
        base.update(self.get_ID(self))
        return base

def new_GroupedByInLine(line, what, ref_ID, actual_where):
    gb = GroupedByInLine(line=line, what=what, ref_ID=ref_ID)
    gb.actual_where = actual_where
    return gb

class SensorsInLine(OwEntity):
    sensor = Reference(Sensor)
    line = Reference(Line)
    key = Key(sensor, line)


class DataInLine(OwEntity):
    line = Reference(Line)
    time = Property(int)
    value = Property(float)
    key = Key(line, time)


"""
# Graph definition
{
    "GID": "temp123", # voor temporary graphs als resultaat van een create_graph
    OF "GID": 123,	# voor echt opgeslagen graphs

    # metadata zoals in request van create_graph
    "timespan": ...
    "group_by": ...
    "where": ...
    
    # Each object here represents one line in the graph
    "lines": [
        {
        # Use grouped_by to create a fitting title for the line
        "grouped_by": [{
            "what": "Location",
            "LID": 1
        }, {
            "what": "Type",
            "ID": "Electricity"
        }],
        # This may be a single sensor, but at least one
        "sensors": [1,45,23,789],
        "values":  [
                # Values of average of ALL SENSORS IN THE "sensors" ATTRIBUTE ABOVE
                [13245647, 12.2],
                [13245648, 12.3],
                ...
        ],
        }, {
        # Similar as above.
        # The logic is that for each line you want, you get an object like this
        }
    ]
}

Request
{
	"type": "create_graph",
	"group_by": [ {
		"what": "Location"
		"IDs": [1,2,3,4,5,6]
    }, {
		"what": "Type",
		"IDs": ["Electricity", "Gas", "Water"],
    }, {
      	"what": "Tag",
      	"IDs": ["keuken", "test"]
    }, {
      	"what": "Sensor",
      	"IDs": [2,3,4,4]
    },  {
      	"what": "Eur_per_Unit",
      	"IDs": [5,20,35,10]
    }],
    "where": [{  # filter on SENSORS!!
        "field": "SID",
        "op": "in"
        "value": [1,2,3,4,5,6],
    }],
	"timespan": {
        "valueType": "DayValue",
    	"start": 15555555,
    	"end": 155566666 
  	}
}

"""

