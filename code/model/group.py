
from .owentity import *
from sparrow import *
from .wall import Wall

class Group(RTOwEntity):
    key = GID = KeyProperty()
    title = Property(str)
    description = Property(str)
    wall = Reference(Wall)  # Not RT because it never really changes

