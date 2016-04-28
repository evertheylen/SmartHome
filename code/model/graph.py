
from sparrow import *

from .owentity import *

from .sensor import Sensor
from .value import *

# Dictionary to limit possible fields on which to filter in 'where' clause
value_props_per_type = {}
for cls in Value, HourValue, DayValue, MonthValue, YearValue:
    value_props = {p.name: p for p in cls._props if p.json}
    value_props_per_type[cls.__name__] = (cls, value_props)

sensor_props = {p.name: p for p in Sensor._props if p.json}


class Graph(OwEntity):  
    timespan_valuetype_type = Enum("Value", "HourValue", "DayValue", "MonthValue", "YearValue")
    
    key = GID = KeyProperty()
    
    timespan_start = Property(int)
    timespan_end = Property(int)
    timespan_valuetype = Property(timespan_valuetype_type)
    
    title = Property(str)
    
    #group_by = TODO
    
    #where = TODO
    
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
                    extra_wheres.append(Sensor.SID == SID)
            elif g["what"] == "Type":
               for t in g["IDs"]:
                   if t not in Sensor.type_type.options:
                       raise Error("unknown_type", "Unknown type")
                   extra_wheres.append(Sensor.type == t)
            elif g["what"] == "Tag":
                for t in g["IDs"]:
                    # Not really a where but anyway
                    extra_wheres.append(RawSql("SELECT * FROM table_sensor WHERE table_sensor.SID IN (SELECT table_tag.sensor_SID FROM table_Tag WHERE text = %(tagtext)s)", {"tagtext": t}))
            elif g["what"] == "Location":
                for LID in g["IDs"]:
                    extra_wheres.append(Sensor.location == LID)
            else:
                raise Error("no_such_group_by", "There is no such group_by 'what' attribute")

            new_where_list = []
            for wheres in wheres_list:
                for w in extra_wheres:
                    new_where_list.append([w]+wheres)
            wheres_list = new_where_list

        lines = []
        for wheres in wheres_list:
            print("wheres = ", ", ".join([str(w) for w in wheres]))
            sensors = await Sensor.get(*wheres).all(db)
            IDs = [s.SID for s in sensors]
            # TODO give more metadata
            line = Line(graph=self.key)
            await line.build(db, IDs, self, db)
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
        return {"grouped_by": self.grouped_by,
                "sensors": self.sensors,
                "values": [list(v) for v in self.values],
                "timespan": self.timespan
                }

    
    
            
class Line(OwEntity):
    # grouped_by = TODO
    key = LID = KeyProperty()
    graph = Reference(Graph)
    
    # TO BE FILLED
    values = []  # tuples (value, time)
    sensors = [] # simple ID's
    
    filled = False
    
    async def build(self, sensors, graph, db):
        self.sensors = sensors
        req = RawSql("SELECT time, avg(value) AS value FROM {g.cls._table_name} WHERE sensor_SID IN {sensors} GROUP BY time HAVING time >= %(start)s AND time < %(end)s ORDER BY time".format(s=self, sensors="("+str(self.sensors[0])+")" if len(self.sensors) == 1 else str(self.sensors)), {
            "start": self.timespan["start"],
            "end": self.timespan["end"],
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
    
    async def fill(self, db):
        if not self.filled:
            data = await DataInLine.get(DataInLine.line == self.key).all(db)
            self.values = [(d.value, d.time) for d in data]
            sil = await SensorsInLine.get(SensorsInLine.line == self.key).all(db)
            self.sensors = [s.SID for s in sil]
    
    def json_repr(self):
        assert self.filled, "Not filled"
        return {
            "grouped_by": [],
            "sensors": self.sensors,
            "values": [list(v) for v in self.values]
        }
    
    
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

