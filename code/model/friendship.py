
from sparrow import *

from .owentity import *
from .user import User

class Friendship(OwEntity):
    # status_type = Enum("FRIENDS", "PENDING")
    #
    # status = Property(status_type)
    user1 = RTReference(User)
    user2 = RTReference(User)

    key = Key(user1, user2)

    constraint = lambda e: e.user1 < e.user2

    # Important example!
    @classmethod
    async def contains(cls, u1: int, u2: int, db):
        if u1 > u2:
            u1, u2 = u2, u1
        c = await is_friend_req.with_data(u1=u1, u2=u2).count(db)
        assert(0<=c<=1)
        return c == 1

    @classmethod
    async def make_friend(cls, u1: int, u2: int, db):
        if u1 > u2:
            u1, u2 = u2, u1
        await Friendship(user1=u1, user2=u2).insert(db)
    
    @classmethod
    async def unfriend(cls, u1, u2, db):
        if u1 > u2:
            u1, u2 = u2, u1
        # Possibly not very efficient, but needed for consistency with caching
        # TODO
        f = await Friendship.find_by_key((u1, u2),db)
        await f.delete(db)

is_friend_req = Friendship.get(Friendship.key == (Field("u1"), Field("u2"))).to_raw()
