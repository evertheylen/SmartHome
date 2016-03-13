
import psycopg2
import momoko

from tornado import gen

# Example usage:
class User(Entity):
    name = Property(str)
    mail = Property(str, sql_constraints="UNIQUE")
    password = Property(str)
    
    # Key is automatically created

class Sensor(Entity):
    desc = Property(str)
    user = Reference(User)
    
    
    
class Value(Entity):
    sensor = Reference(Sensor)
    date = Property(int, constraints = [lambda i: i>=0])
    value = Property(float)
    
    key = [sensor, date]
    
    
async def test():
    u = await User.get(User.mail == "...").fetchone()
    # Error when there is more or less than 1
    
    sensors = await Sensor.get(Sensor.user == u).fetchall()
    more_sensors = await Sensor.get(Sensor.user.key == 123).fetchall()
    # equivalent but faster
    more_sensors2 = await Sensor.get_by_key(123).fetchone()
    
    s = Sensor(desc="bla", user=u)
    await s.put()  # save in database
    s.desc = "test"
    s.put()  # updates the entity in the database
    
    
    

class Property:
    def __init__(self, typ, constraints = [], sql_constraints = "", required = True):
        self.typ = typ
        self.constraints = constraints
        self.sql_constraints = sql_constraints
        self.required = required


class Entity(metaclass=MetaEntity):
    pass


class RawDatabase:
    def __init__(self, logger, ioloop):
        self.logger = logger
        dsn = "dbname=testdb user=postgres password=postgres host=localhost port=5432"
        self.db = momoko.Pool(dsn=dsn, size=5, ioloop=ioloop)
        self.db.connect()

    async def get(self, tname, keyprop, keyval):
        select_query = "SELECT * FROM {tname} WHERE {keyprop} = %s".format(tname=tname, keyprop=keyprop)
        cursor = await self.db.execute(select_query, (keyval,))
        result = cursor.fetchone()
        return result

    async def get_multi(self, tname, keyprop, keyval):
        select_query = "SELECT * FROM {tname} WHERE {keyprop} = %s".format(tname=tname, keyprop=keyprop)
        cursor = await self.db.execute(select_query, (keyval,))
        result = cursor.fetchall()  # difference
        return result

    async def get_all(self, tname):
        select_query = "SELECT * FROM %s"
        cursor = await self.db.execute(select_query, (tname,))
        result = cursor.fetchall()
        return result

    # db.update(self.table_name, [prop], [val], self.db_key, self.__dict__[self.db_key])
    # TODO More efficient: create strings on beforehand (using metaclasses)
    async def update(self, tname, props, vals, keyprop, keyval):
        placeholders = ','.join(['%s'] * len(props))
        update_query = "UPDATE {tname} SET ({props}) = ({placeholders}) WHERE {keyprop} = %s".format(
            tname = tname, props=", ".join(props), placeholders = placeholders, keyprop=keyprop)
        cursor = await self.db.execute(update_query, (*vals, keyval))
        # TODO return status?

    async def insert(self, tname, props, vals, keyprop):
        placeholders = ','.join(['%s'] * len(props))
        insert_query = "INSERT INTO {tname} ({props}) VALUES ({placeholders}) RETURNING {keyprop}".format(
            tname = tname, props=", ".join(props), placeholders = placeholders, keyprop = keyprop)
        cursor = await self.db.execute(insert_query, (*vals,))
        return cursor.fetchone()

    async def delete(self, tname, keyprop, keyval):
        delete_query = "DELETE FROM {tname} WHERE {keyprop} = %s".format(tname = tname, keyprop = keyprop)
        cursor = await self.db.execute(delete_query, (keyval,))
