# draft of the location entity, will need changes for future development
#Sparrow integration
from libs import sparrow

class Location(Entity):
    key = LID = KeyProperty()
    description = Property(str)
    coordinates = Property(int)
    price = Property(str) # this will be the KWH/EUR
    user = Reference(User)
