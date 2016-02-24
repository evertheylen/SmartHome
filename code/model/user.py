
from . import Base

class User(Base):
    def __init__(self, ID, first_name, last_name, password, email, wall_ID):
        self.ID = ID
        self.first_name = first_name
        self.last_name = last_name
        self.password = password
        self.email = email
        self.wall_ID = wall_ID


    json_props = ["ID", "first_name", "last_name", "password", "email", "wall_ID"]
