
# Sparrow integration

from sparrow import *

from .user import User

class Sensor(RTEntity):
    key = SID = KeyProperty()
    type = Property(str)
    title = Property(str)
    user = Reference(User)

