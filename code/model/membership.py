
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
    last_change = Property(int, constraint=lambda c: c < round(time()) + 30)
    # Max 30 seconds in the future.
    # Should be set on every update of status
    
    key = Key(user, group)
    
    
