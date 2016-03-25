
from sparrow import *
from .sensor import Sensor

class Value(Entity):
    value = Property(float)
    time = Property(int)
    sensor = Reference(Sensor)
    key = Key(sensor, time)
