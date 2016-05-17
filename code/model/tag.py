
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Tag(RTOwEntity):
    description = Property(str)
    key = TID = KeyProperty()

    async def is_authorized(self, usr, sensor, db):
        s = await Sensor.find_by_key(sensor, db)
        return s.user == usr

    def json_repr(self):
        return {
            "TID": self.TID,
            "text": self.description
        }
