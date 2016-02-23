class Status:
    def __init__(self, ID, name, wall_ID, user_ID, text, isPublic, graph_ID=None):
        self.ID = ID
        self.wall_ID = wall_ID
        self.user_ID = user_ID
        self.text = text
        self.isPublic = isPublic
        self.graph_ID = graph_ID

    def toDict(self):
        '''Returns the dictionary representation of a status object'''
        return dict([("ID",self.ID),("wall_ID",self.wall_ID),("user_ID",self.user_ID),("text",self.text),("isPublic",self.isPublic),("graph_ID",self.graph_ID)])
