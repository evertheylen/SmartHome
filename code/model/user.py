
from . import Base
from collections import OrderedDict

class User(Base):
    def __init__(self, UID, first_name, last_name, password, email):
        self.UID = UID
        self.first_name = first_name
        self.last_name = last_name
        self.password = password
        self.email = email
    
    db_props = OrderedDict([
                ("UID", "INT PRIMARY KEY"),
                ("password", "VARCHAR"),
                ("first_name", "VARCHAR"),
                ("last_name", "VARCHAR"),
                ("email", "VARCHAR")])
    
    db_keys = [("UID")]

    json_props = ["UID", "first_name", "last_name", "email"]
    
