
from . import Base

# from libs import sparrow
#
# class Wall(Entity):
#     key = WID = KeyProperty()



class Wall(Base):
    def __init__(self, ID):
        self.ID = ID

    json_props = ["ID"]
