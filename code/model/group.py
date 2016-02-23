class Group:
    def __init__(self, ID, name, wall_ID):
        self.ID = ID
        self.name = name
        self.wall_ID = wall_ID

    def toDict(self):
        '''Returns the dictionary representation of a group object'''
        return dict([("ID",self.ID),("name",self.name),("wall_ID",self.wall_ID)])
