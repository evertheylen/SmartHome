
import psycopg2
import momoko

from tornado import gen


class Database:
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

    # TODO test
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
        return cursor.fetchone()  # TODO what does this return?

    async def delete(self, tname, vals, keyprop):
        delete_query = "DELETE FROM {tname} WHERE {keyprop} = {vals}".format(tname = tname, keyprop = keyprop, vals)
        cursor = await self.db.execute(delete_query, (tname,))
        return cursor.fetchone()  # TODO what does this return?
