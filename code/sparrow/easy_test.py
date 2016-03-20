from sparrow import *

class User(Entity):
    name = Property(str)
    mail = Property(str, sql_extra="UNIQUE")
    password = Property(str, constraint=lambda p: len(p) >= 8, json=False)
    
    key = UID = KeyProperty()

class Sensor(Entity):
    name = Property(str)
    user = Reference(User)
    
    key = SID = KeyProperty()
    
class Value(Entity):
    sensor = Reference(Sensor)
    date = Property(int)
    value = Property(float)
    
    key = Key(sensor, date)

print(Value._create_table_command)

u = User(name="Evert", mail="evert@heylen.com", password="123456789")
u.password = "otherpass"
assert u.password == "otherpass"

catched_error = False
try:
    u.password = "short"
except:
    catched_error = True
assert catched_error

sint = User(name="Sint", mail="sint@klaas.com", password="789412345")

sint.password = "sintpass"
u.password = "userpass"

assert u.password == "userpass"
assert sint.password == "sintpass"

u.key = 456

s = Sensor(name="Test sensor", user=u.key)
print("s.user_UID", s.user_UID)






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





import tornado
import tornado.ioloop

import random

def randstring(l=5):
    s = ""
    for i in range(l):
        s += chr(random.randint(ord("a"), ord("z")))
    return s
    

app = SparrowApp(None, tornado.ioloop.IOLoop.current(), [User])

async def do_stuff():
    users = await User.get().all(app.db)
    u = users[0]
    
    

async def dont_stuff():
    """
    await app.uninstall("StijnHeeftGeenSmaak")  # secret key to uninstall :P
    a = now()
    await app.install()
    b = now()
    print(repr(b-a))
    """
    
    q = RawClassedSql(User, "SELECT * FROM table_User WHERE mail LIKE %(mail)s")
    #print(q)
    qq = q.with_data(mail = "%")
    result = await qq.exec(app.db)
    result.scroll(2)
    result.scroll(-1)
    #print(q.data)
    #print(qq.data)
    #print("users = ", "\n".join([u.to_json() for u in result.all()]))
    
    users_q = User.get(Where(User.mail, "LIKE", Unsafe("%"))).order(User.name)
    #print(str(users_q))
    users = await users_q.all(app.db)
    print("\n".join([u.to_json() for u in users]))
    
    newu = User(name="New User", mail=randstring() + "_user@mail.com", password="asdfghjkl")
    await newu.put(app.db)
    print(newu.key)
    #i = await Insert(newu, returning=User.UID).raw(app.db)
    #print(i)
    
    
    
tornado.ioloop.IOLoop.current().run_sync(do_stuff)
