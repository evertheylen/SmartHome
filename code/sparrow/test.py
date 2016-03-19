from sparrow import *

class User(Entity):
    name = Property(str)
    mail = Property(str, sql_extra="UNIQUE")
    password = Property(str, constraints = [lambda p: len(p) > 8])
    
    key = UID = KeyProperty()

    json_props = [name, mail]


class Sensor(Entity):
    desc = Property(str)
    user = Reference(User)
    
    key = SID = KeyProperty()
    
    json_props = [desc, user]

    
class Value(Entity):
    sensor = Reference(Sensor, update=True)  # Update the Sensor when a Value is added
    date = Property(int, constraints = [lambda i: i>=0])
    value = Property(float, required=False)  # to showcase 'required'
    
    key = Key(sensor, date)
    
    def json_repr(self):
        return [self.date, self.value]


class Friends(Entity):
    UID1 = Reference(User)
    UID2 = Reference(User)
    
    key = Key(UID1, UID2)
    
    constraints = [lambda e: e.UID1 < e.UID2]
    
    # Important example!
    is_friend_req = Friends.get_by_key("%s", "%s")
    async def contains(UID1, UID2):
        if UID1 > UID2:
            UID1, UID2 = UID2, UID1
        c = await is_friend_req.sql_format(UID1, UID2).count()
        assert(0<=c<=1)
        return c == 1
    
    async def make_friend(UID1, UID2):
        if UID1 > UID2:
            UID1, UID2 = UID2, UID1
        await Friends(UID1=UID1, UID2=UID2).put()
    
    async def unfriend(UID1, UID2):
        if UID1 > UID2:
            UID1, UID2 = UID2, UID1
        # Possibly not very efficient, but needed for consistency with caching
        f = await Friend.get_by_key(UID1, UID2).fetchone()
        await f.delete()

    
async def test():
    db.connect()
    db.init()
    
    
    u = await User.get(User.mail == "e@e").fetchone()
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
    s.add_listener(conn)
    s.remove_listener(conn)
    conn.remove_all_listenees()
    