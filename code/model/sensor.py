
from .owentity import *
from sparrow import *
from .user import User

class Sensor(RTOwEntity):
    key = SID = KeyProperty()
    type = Property(str)
    title = Property(str)
    user = Reference(User)
    #location = Reference(Location)

