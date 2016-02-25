
from . import Base
from collections import OrderedDict

class Sensor(Base):
    def __init__(self, SID, type, title):
        self.SID = SID
        self.type = type
        self.title = title
    db_props = OrderedDict([
                ("SID", "SERIAL PRIMARY KEY"),
                ("type", "VARCHAR"),
                ("title", "VARCHAR")])

    db_key = "SID"
    table_name = "Sensors"

    json_props = ["SID", "type", "title"]
