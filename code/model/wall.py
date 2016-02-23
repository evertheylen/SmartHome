class Wall:
    def __init__(self, ID):
        self.ID = ID

    def toDict(self):
        '''Returns the dictionary representation of a wall object'''
        return dict([("ID",self.ID)])
