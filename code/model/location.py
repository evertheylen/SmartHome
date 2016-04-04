
from sparrow import *

from .owentity import *
from .user import User

class Location(RTOwEntity):
    key = LID = KeyProperty()
    description = Property(str, constraint=lambda d: len(d) <= 500)
    
    # address
    number = Property(int)
    street = Property(str)
    city = Property(str, constraint=lambda d: len(d) <= 200)
    postalcode = Property(int)
    country = Property(str, constraint=lambda d: len(d) <= 100)
    
    user = Reference(User)
    
    def is_authorized(self, type, usr):
        return usr.key == self.user
