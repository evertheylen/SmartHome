
from .owentity import *
from sparrow import *
from .sensor import Sensor

class Value(OwEntity):
    value = Property(float)
    time = Property(int)
    sensor = Reference(Sensor)
    key = Key(sensor, time)
