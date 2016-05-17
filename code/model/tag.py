
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Tag(RTOwEntity):
    description = Property(str)
    key = TID = KeyProperty()


    def json_repr(self):
        return {
            "TID": self.TID,
            "text": self.description
        }
