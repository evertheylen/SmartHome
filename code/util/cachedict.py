
from collections import defaultdict
import threading

class CacheEntry:
    def __init__(self, val):
        self.lock = threading

class Cache:
    """
    Basically a protected defaultdict. Or in fancy webterminology, a cached Key-Multivalue store.
    (I'm not sure that is even a thing.) Primarily used as a cache for websocket listeners.
    """
    
    def __init__(self, typ=list):
        self._data = defaultdict(typ)
        self.typ = typ
        
    
    
    
        
    