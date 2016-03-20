
class Cached(type):
    def __init__(self, *args, **kwargs):
        super(Cached, self).__init__(*args, **kwargs)
        self.cache = {}
    
    def __call__(self, *args, **kwargs):
        inst = super(Cached, self).__call__(*args, **kwargs)
        if inst in self.cache:
            return self.cache[inst]
        else:
            self.cache[inst] = inst
            return inst

class KeyValue(metaclass=Cached):
    def __init__(self, key, val):
        self.key = key
        self.val = val
    
    def __eq__(self, other):
        return type(self) == type(other) and self.key == other.key
    
    def __hash__(self):
        return hash(self.key)


a = KeyValue(5, "hello")
b = KeyValue(5, "test")

print(b.val)
