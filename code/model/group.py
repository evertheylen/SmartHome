
from . import Base
# #Sparrow integration
# from libs import sparrow
#
# class Group(Entity):
#     key = GID = KeyProperty()
#     name = Property(str)
#     WID_reference = Reference(Wall)

class Group(Base):
    def __init__(self, ID, name, wall_ID):
        self.ID = ID
        self.name = name
        self.wall_ID = wall_ID

    #def to_dict(self):
        #'''Returns the dictionary representation of a group object'''
        #return {
            #"ID": self.ID,
            #"name": self.name,
            #"wall_ID": self.wall_ID
        #}

    # MAAR er is nog een snellere manier, die realiseer ik mij nu pas
    # Om dit te doen werken hebben we een Base klasse nodig
    json_props = ["ID", "name", "wall_ID"]
