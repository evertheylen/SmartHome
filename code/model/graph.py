
from sparrow import *

from .owentity import *

class Line:
    def __init__(self, grouped_by, sensors, timespan, cls):
        self.grouped_by = grouped_by
        # TODO wtf @grouped_by
        self.sensors = tuple(sensors)
        self.timespan = timespan
        self.cls = cls
        self.values = []

    async def fill(self, db):
        req = RawSql("SELECT time, avg(value) AS value FROM {s.cls._table_name} WHERE sensor_SID IN {sensors} GROUP BY time HAVING time >= %(start)s AND time < %(end)s ORDER BY time".format(s=self, sensors="("+str(self.sensors[0])+")" if len(self.sensors) == 1 else str(self.sensors)), {
            "start": self.timespan["start"],
            "end": self.timespan["end"],
        })
        result = await req.exec(db)
        self.values = result.raw_all()

    def json_repr(self):
        return {"grouped_by": self.grouped_by,
                "sensors": self.sensors,
                "values": [list(v) for v in self.values]}

class GraphGroupBy(OwEntity):
    key = GID = KeyProperty()
    

class Graph(OwEntity):
    timespan_valuetype_type = Enum("Value", "HourValue", "DayValue", "MonthValue", "YearValue")
    
    key = GID = KeyProperty()
    
    timespan_from = Property(int)
    timespan_to = Property(int)
    timespan_valuetype = Property(timespa_valuetype_type)
    
    group_by = 
    
    def json_repr(self):
        return {"grouped_by": self.grouped_by,
                "sensors": self.sensors,
                "values": [list(v) for v in self.values],
                "timespan": self.timespan}

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

