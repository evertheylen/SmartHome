from sparrow import *

class User(Entity):
    name = Property(str)
    mail = Property(str, sql_extra="UNIQUE")
    #password = Property(str)
    password = Property(str, constraints = [lambda p: len(p) >= 8])
    
    key = UID = KeyProperty()

    json_props = [name, mail]

u = User(name="Evert", mail="evert@heylen.com", password="123456789")
u.password = "otherpass"
assert u.password == "otherpass"

catched_error = False
try:
    u.password = "short"
except:
    catched_error = True
#assert catched_error

sint = User(name="Sint", mail="sint@klaas.com", password="789412345")

sint.password = "sintpass"
u.password = "userpass"

assert u.password == "userpass"
assert sint.password == "sintpass"




# Benchmarks --------------------------------------------

# Pretty good on my system it seems...
# An init using db_args is only 3 times as slow as a 'Simple' init
# However, compared to for example the app.install() instruction,
# (which at the time of writing simply had to create 1 table), the
# time used to init is neglibible: ~2us vs 30000us

class Simple:
    def __init__(self, name, mail, password, UID):
        self.name = name
        self.mail = mail
        self.password = password
        self.UID = UID

import datetime
now = lambda: datetime.datetime.now()

def test(times):
    a = now()
    for i in range(times):
        newu = User(name="Evert", mail="evert@heylen.com", password="123456789")
        #newu = User(db_args=("Evert", "evert@heylen.com", "123456789", 2))
        #u.password = "123456789"
        #s = Simple("Evert", "evert@heylen.com", "123456789", 2)
        
        #blah = u.__dict__["mail"]
        #blah = u.mail
    b = now()
    print(repr(b-a))

test(50000)

# -------------------------------------------------------




print(User.create_table_command)

import tornado
import tornado.ioloop

app = SparrowApp(None, tornado.ioloop.IOLoop.current(), [User])

async def do_stuff():
    """
    await app.uninstall("StijnHeeftGeenSmaak")  # secret key to uninstall :P
    a = now()
    await app.install()
    b = now()
    print(repr(b-a))
    """
    
    q = RawSqlStatement("SELECT * FROM table_User WHERE mail LIKE %(mail)s", User)
    print(q)
    qq = q.with_data(mail = "%")
    result = await qq.exec(app.db)
    result.scroll(2)
    result.scroll(-1)
    print(q.data)
    print(qq.data)
    print("users = ", "\n".join([u.to_json() for u in result.all()]))
    
    
    
tornado.ioloop.IOLoop.current().run_sync(do_stuff)
