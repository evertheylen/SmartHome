
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Tag(OwEntity):
    text = Property(str)
    sensor = Reference(Sensor)
    key = Key(sensor,text)

    async def is_authorized(self, type, usr, db, **kwargs):
        s = await Sensor.find_by_key(self.sensor).single(db)
        return s.user == usr.key
