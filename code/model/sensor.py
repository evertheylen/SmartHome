
from .owentity import *
from sparrow import *
from .user import User
from .location import Location

class Sensor(RTOwEntity):
    type_type = Enum("water", "electricity", "gas", "other")
    # Weird name but it is quite literally the type of the type property

    key = SID = KeyProperty()
    type = Property(type_type)
    title = Property(str)
    user = Reference(User)
    location = Reference(Location)
    EUR_per_unit = Property(float)

    async def is_authorized(self, type: str, usr: User, **kwargs):
        return self.user == usr.key
