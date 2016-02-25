
from . import Base
from collections import OrderedDict

class Sensor(Base):
    def __init__(self, SID, type, title, UID):
        self.SID = SID
        self.type = type
        self.title = title
        self.UID = UID
    
    db_props = OrderedDict([
                ("SID", "SERIAL PRIMARY KEY"),
                ("type", "VARCHAR"),
                ("title", "VARCHAR"),
                ("UID", "INT REFERENCES Users")])

    db_key = "SID"
    table_name = "Sensors"

    json_props = ["SID", "type", "title", "UID"]
