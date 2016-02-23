
from . import Base

class Wall(Base):
    def __init__(self, ID):
        self.ID = ID

    json_props = ["ID"]
