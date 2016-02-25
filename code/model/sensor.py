from . import Base

class Sensor(Base):
    def __init__(self, SID, type, title):
        self.SID = SID
        self.type = type
        self.title = title

    json_props = ["SID", "type", "title"]
