
from sparrow import *
from .owentity import *
from .sensor import Sensor
from .tag import Tag


class Tagged(RTOwEntity):
    sensor = RTReference(Sensor)
    tag = RTReference(Tag)

    key = Key(sensor, tag)
