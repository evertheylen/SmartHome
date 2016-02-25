
from . import Base

class Status(Base):
    def __init__(self, ID, name, wall_ID, user_ID, text, is_public, graph_ID=None):
        self.ID = ID
        self.wall_ID = wall_ID
        self.user_ID = user_ID
        self.text = text
        self.is_public = is_public
        self.graph_ID = graph_ID

        json_props = ["ID", "name", "wall_ID", "user_ID", "text", "is_public", "graph_ID"]