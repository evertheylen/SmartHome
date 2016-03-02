
from collections import defaultdict

class ListenersCache:
    """
    Data structure for maintaining which connection is listening to which objects
    """
    
    def __init__(self):
        # obj --> set(connections)
        self.who = defaultdict(set)
        # connection --> set of objects
        self.which = defaultdict(set)
    
    
    def register(self, conn, obj):
        self.who[obj].add(conn)
        self.which[conn].add(obj)
    
    def unregister(self, conn, obj):
        self.who[obj].remove(conn)
        self.which[conn].remove(obj)
    
    def unregister_all(self, conn):
        for o in self.which[conn]:
            self.who[o].remove(conn)
        del self.which[conn]
    
    def connections(self, obj):
        yield from self.who[obj]
    
    
    
    
        
    