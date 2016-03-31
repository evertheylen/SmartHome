
from .owentity import *
from sparrow import *
from .user import User
from .location import Location

class Sensor(RTOwEntity):
    key = SID = KeyProperty()
    type = Property(str)
    title = Property(str)
    user = Reference(User)
    location = Reference(Location)
    
    async def is_authorized(self, type: str, usr: User, **kwargs):
        return self.user == usr.key

