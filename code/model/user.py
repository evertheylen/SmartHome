
from . import Base
from collections import OrderedDict

# #Sparrow integration
# from libs import sparrow
#
# class User(RTEntity):
#     key = UID = KeyProperty()
#     first_name = Property(str)
#     last_name = Property(str)
#     password = Property(str,constraint=lambda p: len(p) >= 8)
#     email = Property(str,sql_extra="UNIQUE")
#     GID_reference = Reference(Group)
#     WID_reference = Reference(Wall)
#     constraint = lambda u: u.UID > 0 and len(u.first_name) > 5 and len(u.first_name) < 100

class User(Base):
    def __init__(self, UID, first_name, last_name, password, email):
        self.UID = UID
        self.first_name = first_name
        self.last_name = last_name
        self.password = password
        self.email = email

    # TODO
    constraints = {
        "UID": [lambda uid: uid > 0],
        "first_name": [lambda fn: len(fn) > 5, lambda fn: len(fn) < 100],
    }

    db_props = OrderedDict([
                ("UID", "SERIAL PRIMARY KEY"),
                ("password", "VARCHAR"),
                ("first_name", "VARCHAR"),
                ("last_name", "VARCHAR"),
                ("email", "VARCHAR UNIQUE NOT NULL")])
    db_key = "UID"
    table_name = "Users"

    json_props = ["UID", "first_name", "last_name", "email"]
