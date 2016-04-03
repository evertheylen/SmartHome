
from .owentity import *
from sparrow import *

# Not realtime again
class Wall(OwEntity):
    key = WID = KeyProperty()
    is_user = Property(bool, json=False)
    # owner can be a user or a group
