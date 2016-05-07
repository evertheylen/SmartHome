
from sparrow import *

from .owentity import *
from .status import Status
from .user import User

class Comment(RTOwEntity):
    key = CID = KeyProperty()
    status = RTReference(Status)
    author = RTReference(User)
    date = Property(int)
    date_edited = Property(int)  # If they are the same, no edits
    text = Property(str)

    async def can_delete(self, usr_uid, db):
        u = await User.find_by_key(self.author, db)
        return u.key == usr_uid
