
from sparrow import *

from .owentity import *
from .status import Status
from .user import User

class Comment(RTOwEntity):
    CID = KeyProperty()
    status = RTReference(Status)
    author = RTReference(User)
    date = Property(int)
    date_edited = Property(int)  # If they are the same, no edits
    text = Property(str)

    key = Key(CID,status)
