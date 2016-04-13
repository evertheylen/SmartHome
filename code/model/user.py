
from sparrow import *

from .owentity import *
from .wall import Wall

class User(RTOwEntity):
    key = UID = KeyProperty()
    # TODO reconsider excessive constraints on length?
    first_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    last_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    password = Property(str, constraint=lambda p: 8 <= len(p) <= 100, json=False)
    email = Property(str, constraint=lambda p: 1 <= len(p) <= 100, sql_extra="UNIQUE")
    admin = Property(bool)

    # Social stuff
    wall = Reference(Wall)

    def is_authorized(self, type, usr, **kwargs):
        return self == usr


    def __str__(self):
        try:
            return "User({})".format(self.email)
        except:
            return "some User"
