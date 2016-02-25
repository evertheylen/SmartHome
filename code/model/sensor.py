from . import Base

class Sensor(Base):
    def __init__(self, ID, type, title):
        self.ID = ID
        self.type = type
        self.title = title

    json_props = ["ID", "type", "title"]
