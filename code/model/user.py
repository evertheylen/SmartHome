class User:
    def __init__(self, ID, firstname, lastname, password, email, wall_ID):
        self.ID = ID
        self.firstname = firstname
        self.lastname = lastname
        self.password = password
        self.email = email
        self.wall_ID = wall_ID

    def toDict(self):
        # to dict representation, not sure what the specific representation is yet :/
        # TODO pass for now
        pass
