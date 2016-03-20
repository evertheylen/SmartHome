

class OwnProp(property):
    def __init__(self, name):
        self.name = name
        
    
    
    def __eq__(self, other):
        return "This is not a bool :P"

class Test:
    def __init__(self):
        self._a = 5
    
    a = OwnProp("_a")

    
    
t1 = Test()
t2 = Test()
