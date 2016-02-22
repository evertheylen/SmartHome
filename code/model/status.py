class Status:
    def __init__(self, ID, name, wall_ID, user_ID, text, isPublic, graph_ID=None):
        self.ID = ID
        self.wall_ID = wall_ID
        self.user_ID = user_ID
        self.text = text
        self.isPublic = isPublic
        self.graph_ID = graph_ID

    def toDict(self):
        # to dict representation, not sure what the specific representation is yet :/
        # TODO pass for now
        pass
