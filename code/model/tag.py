
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Tag(RTOwEntity):
    description = Property(str)
    key = TID = KeyProperty()

    async def is_authorized(self, type, usr, db, **kwargs):
        s = await Sensor.find_by_key(self.sensor).single(db)
        return s.user == usr.key

    def json_repr(self):
        return_value = {}
        return_value["TID"] = self.TID
        return_value["text"] = self.description
        # self.__dict__[p.dataname]
        return return_value
