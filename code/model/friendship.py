
from sparrow import *

from .owentity import *
from .user import User

class Friendship(OwEntity):
    user1 = RTReference(User)
    user2 = RTReference(User)

    key = Key(user1, user2)

    constraint = lambda e: e.user1 < e.user2

    # Important example!
    async def contains(u1: int, u2: int, db):
        if u1 > u2:
            u1, u2 = u2, u1
        c = await is_friend_req.with_data(u1=u1, u2=u2).count(db)
        assert(0<=c<=1)
        return c == 1

    async def make_friend(u1: int, u2: int, db):
        if u1 > u2:
            u1, u2 = u2, u1
        await Friendship(user1=u1, user2=u2).insert(db)

    async def unfriend(u1, u2, db):
        if u1 > u2:
            u1, u2 = u2, u1
        # Possibly not very efficient, but needed for consistency with caching
        # TODO
        f = await Friendship.find_by_key((u1, u2),db)
        await f.delete(db)

is_friend_req = Friendship.get(Friendship.key == (Field("u1"), Field("u2"))).to_raw()
