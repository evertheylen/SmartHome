
import psycopg2
import momoko

from tornado import gen

class Database:
    def __init__(self, logger, ioloop):
        self.logger = logger
        dsn = "dbname=testdb user=postgres password=postgres host=localhost port=5432"
        self.db = momoko.Pool(dsn=dsn, size=5, ioloop=ioloop)
        self.db.connect()
    
    async def get_users(self):
        cursor = await self.db.execute("SELECT * FROM test")
        desc = cursor.description
        result = [dict(zip([col[0] for col in desc], row))
                  for row in cursor.fetchall()]
        print(result)
        return result
