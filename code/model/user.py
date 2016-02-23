class User:
    def __init__(self, ID, firstname, lastname, password, email, wall_ID):
        self.ID = ID
        self.firstname = firstname
        self.lastname = lastname
        self.password = password
        self.email = email
        self.wall_ID = wall_ID

    def toDict(self):
        '''Returns the dictionary representation of an user object'''
        return dict([("ID",self.ID),("firstname",self.firstname),("lastname",self.lastname),("email",self.email),("wall_ID",self.wall_ID)])
