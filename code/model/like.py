
from sparrow import *

from .owentity import *
from .status import Status
from .user import User

class Like(OwEntity):
    status = RTReference(Status)
    user = Reference(User)
    positive = Property(bool)
    key = Key(status, user)
