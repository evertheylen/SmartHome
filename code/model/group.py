
from sparrow import *

from .owentity import *
from .wall import Wall

class Group(RTOwEntity):
    key = GID = KeyProperty()
    title = Property(str)
    description = Property(str)
    public = Property(bool)
    wall = Reference(Wall)  # Not RT because it never really changes
