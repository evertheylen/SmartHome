
from . import Base
from collections import OrderedDict

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
    
