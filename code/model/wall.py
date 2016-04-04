
from .owentity import *
from sparrow import *

class Wall(RTOwEntity):
    key = WID = KeyProperty()
    is_user = Property(bool, json=False)
    # owner can be a user or a group
