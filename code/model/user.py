
from .owentity import *
from sparrow import *

class User(RTOwEntity):
    key = UID = KeyProperty()
    # TODO reconsider excessive constraints on length?
    first_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    last_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    password = Property(str, constraint=lambda p: 8 <= len(p) <= 100)
    email = Property(str, constraint=lambda p: 1 <= len(p) <= 100, sql_extra="UNIQUE")
#   group = Reference(Group)
#   wall = Reference(Wall)
    
    def __str__(self):
        return "User({})".format(self.email)
    
