from sparrow import *

class User(Entity):
    name = Property(str)
    mail = Property(str, sql_extra="UNIQUE")
    password = Property(str, constraint = lambda p: len(p) >= 8, json=False)
    
    key = UID = KeyProperty()


class Sensor(Entity):
    title = Property(str)
    user = Reference(User)
    
    key = SID = KeyProperty()

    
class Value(Entity):
    #sensor = Reference(Sensor, update=True)  # Update the Sensor when a Value is added
    sensor = Reference(Sensor)
    date = Property(int, constraint = lambda i: i>=0)
    value = Property(float)
    
    key = Key(sensor, date)
    
    def json_repr(self):
        return [self.date, self.value]


class Friends(Entity):
    user1 = Reference(User)
    user2 = Reference(User)
    
    key = Key(user1, user2)
    
    constraint = lambda e: e.UID1 < e.UID2
    
    # Important example!
    async def contains(u1, u2, db):
        if u1 > u2:
            u1, u2 = u2, u1
        c = await is_friend_req.with_data(u1=u1, u2=u2).count(db)
        assert(0<=c<=1)
        return c == 1
    
    async def make_friend(u1, u2, db):
        if u1 > u2:
            u1, u2 = u2, u1
        await Friends(user1=u1, user2=u2).put(db)
    
    async def unfriend(u1, u2, db):
        if u1 > u2:
            u1, u2 = u2, u1
        # Possibly not very efficient, but needed for consistency with caching
        # TODO
        #f = await Friend.get_by_key(UID1, UID2).fetchone()
        #await f.delete()
    
class SomeRefs(Entity):
    some_friendship = Reference(Friends)
    some_user = Reference(User)
    some_value = Reference(Value)
    
    key = wow_such_long_ID = KeyProperty()

is_friend_req = Friends.get(Friends.key == (Field("u1"), Field("u2"))).to_raw()

    
import tornado
import tornado.ioloop

import random

def randstring(l=5):
    s = ""
    for i in range(l):
        s += chr(random.randint(ord("a"), ord("z")))
    return s
    
app = SparrowApp(None, tornado.ioloop.IOLoop.current(), [User, Sensor, Value, Friends, SomeRefs])

app.info()

#global var
var = {}

async def do_stuff():
    global var
    
    #await app.uninstall("StijnHeeftGeenSmaak")  # secret key to uninstall :P
    #await app.install()
    
    u_evert = User(name="Evert", mail=randstring()+"_e@e", password="12345678")
    await u_evert.put(app.db)
    
    users_result = await User.get().order(User.mail).exec(app.db)
    var["c"] = users_result.cursor
    print(users_result.cursor)
    print("raw", users_result.raw())
    users = users_result.all()
    u1 = random.choice(users)
    u2 = u_evert
    
    s = Sensor(title="Some sensor", user=u1.key)
    await s.put(app.db)
    
    v = Value(sensor=s.key, date=123456, value=3.1415)
    await v.put(app.db)
    
    await Friends.make_friend(u1.key, u2.key, app.db)
    print(u1.key, u2.key)
    q = is_friend_req.with_data(u1=u1.key, u2=u2.key)
    print(q)
    f = await q.single(app.db)
    
    r = SomeRefs(some_friendship=f.key, some_user=u1.key, some_value=v.key)
    await r.put(app.db)

def main():
    tornado.ioloop.IOLoop.current().run_sync(do_stuff)
    
if __name__ == "__main__":
    main()

async def bla():
    # Error when there is more or less than 1
    sensors = await Sensor.get(Sensor.user == u).fetchall()
    more_sensors = await Sensor.get(Sensor.user.key == 123).fetchall()
    # equivalent but faster
    more_sensors2 = await Sensor.get_by_key(123).fetchone()
    
    req = Sensor.get(Sensor.type == "Electricity").order(-Sensor.SID).limit(offset=30, amount=15)
    # sort order (small) --> (big)
    # ↓7            ↓45             ↓452            ↓781       
    # . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
    # ------------------>[~~~~~~~~~~~]
    #       offset           amount           
    
    s = Sensor(desc="bla", user=u)
    await s.put()  # save in database
    s.desc = "test"
    await s.update()  # updates the entity in the database
    
    # conn needs some functions!
    #s.add_listener(conn)
    #s.remove_listener(conn)
    #conn.remove_all_listenees()
    
    