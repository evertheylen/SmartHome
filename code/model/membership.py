
from sparrow import *
from .owentity import *
from .user import User
from .group import Group

from time import time

class Membership(RTOwEntity):
    status_type = Enum("ADMIN", "MEMBER", "PENDING", "BANNED")
    
    status = Property(status_type)
    user = RTReference(User)
    group = RTReference(Group)
    last_change = Property(int)
    
    key = Key(user, group)
    
    
