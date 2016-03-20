
if False:
    # Example usage:
    class User(Entity):
        name = Property(str)
        mail = Property(str, sql_extra="UNIQUE")
        password = Property(str, constraints = [lambda p: len(p) > 8])
        
        key = KeyProperty("UID")

        json_props = [name, mail]

    class Sensor(Entity):
        desc = Property(str)
        user = Reference(User)
        
        key = KeyProperty("SID")
        
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
            f.delete()
        
    async def test():
        u = await User.get(User.mail == "...").fetchone()
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
    
    
    
import collections
import datetime

class Property:
    default_sqltypes = {
        int: "INT",
        str: "VARCHAR",
        float: "REAL",
        bool: "BOOL",
        datetime.datetime: "TIMESTAMP"  # but consider perhaps amount of milliseconds since UNIX epoch
    }
    
    def __init__(self, typ, sql_type=None, constraints = [], sql_extra = "", required = True):
        if sql_type is None:
            sql_type = default_sqltypes[typ]
        self.typ = typ
        self.sql_type = sql_type
        self.constraints = constraints
        self.sql_extra = sql_extra
        self.required = required
        self.name = None  # Set by the metaclass
    
    def to_sql(self, name):
        return "{name} {s.sqltype} {s.sql_extra}".format(name=name, s=self) + " NOT NULL" if self.required else ""


class MetaEntity:
    # Thanks to http://stackoverflow.com/a/27113652/2678118
    
    @classmethod
    def __prepare__(self, name, bases):
        return collections.OrderedDict()

    def __new__(self, name, bases, classdict):
        classdict['__ordered__'] = [key for key in classdict.keys()
                if key not in ('__module__', '__qualname__')]
        return type.__new__(self, name, bases, classdict)
    
    # __init__ sets some extra attributes, but the class itself is already created
    def __init__(cls, name, bases, dct):
        
        # __init__ of Entity needs to have two lists: the required properties and the nonrequired ones
        required_props = []
        nonrequired_props = []
        for (name, p) in dct.items():
            if isinstance(p, Property):
                # Set names of properties
                p.name = name
                if p.required:
                    required_props.append(p)
                else:
                    nonrequired_props.append(p)
        dct["_required_props"] = required_props
        dct["_nonrequired_props"] = nonrequired_props
        
        
        super(MetaEntity, cls).__init__(name, bases, dct)
 

class Entity(metaclass=MetaEntity):
    def __init__(self, in_db=False, **kwargs):
        for p in self._required_props:
            self.__dict__[p.name] = kwargs[p.name]
        
        for p in self._nonrequired_props:
            if p.name in kwargs:
                self.__dict__[p.name] = kwargs[p.name]
            else:
                self.__dict__[p.name] = None
        
        self._listeners = set()
        self.in_db = in_db
    
    def add_listener(self, conn):
        self._listeners.add(conn)
        conn.add_listenee(self)
    
    def remove_listener(self, conn):
        if conn in self._listeners:
            self._listeners.remove(conn)
            conn.remove_listenee(self)
    
    def remove_all_listeners(self):
        for conn in self._listeners:
            self._listeners.remove(conn)
            conn.remove_listenee(self)
    
    def put(self):
        assert(not self.in_db)
        # TODO
        
    def update(self):
        assert(self.in_db)
        # TODO
        
    def delete(self):
        if self.in_db:
            # TODO
            pass
    
    # Methods:
    #   - __init__
    #   - add_listener, remove_listener, remove_all_listeners
    #   - put, update, delete
    #   - to_json, json_repr
    #   - from_db

    # Classmethods:
    #   - get, get_by_key
    #   - create_table_command
    
    # Preprocessing in MetaEntity!
    pass

class Query:
    # filtering (WHERE), ordering (ORDER BY), fetching ...
    # To be extended when needed



