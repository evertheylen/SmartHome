
from .owentity import *
from .user import User
from .wall import Wall
from .graph import Graph
from sparrow import *

class Status(RTOwEntity):
    key = SID = KeyProperty()
    author = RTReference(User)
    wall = RTReference(Wall)
    date = Property(int)
    date_edited = Property(int)  # If they are the same, no edits
    text = Property(str)
    graph = Property(int, required=False)  # This is secretly a reference to Graph
    
