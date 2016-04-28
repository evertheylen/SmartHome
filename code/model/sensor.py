
from .owentity import *
from sparrow import *
from .user import User
from .location import Location

class Sensor(RTOwEntity):
    type_type = Enum("water", "electricity", "gas", "other")
    # Weird name but it is quite literally the type of the type property

    key = SID = KeyProperty()
    type = Property(type_type)
    title = Property(str)
    user = Reference(User)
    location = Reference(Location)
    EUR_per_unit = Property(float)
    
    # The last value this sensor had
    last_value = None
    
    async def is_authorized(self, type: str, usr: User, **kwargs):
        return self.user == usr.key
    
    async def insert_values(self, values, db):
        from .value import Value
        # values is a list of tuples (value, time)
        if len(values) == 0: return
    
        # 'compress' the values
        interesting_values = []

        if self.last_value is None:
            self.last_value = values[0]
            interesting_values.append(self.last_value)
            
        for value in values:
            # no more "connecting" dots, each dot is kind of a line
            # also easier to integrate
            if value[0] != self.last_value[0]:
                self.last_value = value
                interesting_values.append(self.last_value)
        
        c = RawSql("INSERT INTO table_Value VALUES " + ", ".join([str(v+(self.SID,)) for v in interesting_values]))
        await c.exec(db)
        
        Value.aggregates_from_raw(self, interesting_values, db, recurse=True)

