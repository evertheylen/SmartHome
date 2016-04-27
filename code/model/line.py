
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

class Graph(Line):
    def json_repr(self):
        return {}
