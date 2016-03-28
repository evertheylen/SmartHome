
from functools import wraps
import types

def case(*list_what):
    def decorator(function):
        function.__cases__ = list_what
        return function
    return decorator

# not a decorator
def classitems(dct, bases):
    for b in bases:
        yield from classitems(b.__dict__, b.__bases__)
    yield from dct.items()

def create_meta(_func):
    def f(func=_func):
        class MetaSwitch(type):
            __call__ = func
        return MetaSwitch
    return f()
            

class MetaSwitch(type):
    def __new__(self, name, bases, dct):
        dispatch = {}
        def select(arg, *args, **kwargs):
            return arg 
        
        def default(*args, **kwargs):
            pass
        
        for (k,f) in classitems(dct, bases):
            if hasattr(f, "__cases__"):
                for c in f.__cases__:
                    dispatch[c] = f
    
        default = dct.get("default", default)
        select = dct.get("select", select)
        
        dct["select"] = select
        dct["default"] = default
        dct["dispatch"] = dispatch
        
        return type.__new__(self, name, bases, dct)
    
    def __call__(cls, *args, **kwargs):
        key = cls.select(*args, **kwargs)
        if key in cls.dispatch:
            return cls.dispatch[key](*args, **kwargs)
        else:
            return cls.default(*args, **kwargs)

class switch(metaclass=MetaSwitch):
    # Clients don't need to know it uses metaclasses
    pass

#if __name__ == "__main__":
if True:
    class handle(switch):
        def select(obj):
            return type(obj)
        
        @case(float)
        def floating(obj):
            return "got float"
        
        @case(str)
        def string(obj):
            return "got string"
        
        @case(int)
        class integer(switch):
            def select(obj):
                return (obj%2 == 0)
            
            @case(True)
            def even(obj):
                return "got even integer"
            
            @case(False)
            def odd(obj):
                return "got odd integer"
            
        def default(obj):
            return "unknown"

    assert handle("test") == "got string"
    assert handle(5.1) == "got float"
    assert handle(789) == "got odd integer"
    assert handle(456) == "got even integer"
    assert handle(None) == "unknown"

    class cycle_3(switch):
        c01 = case(0,1)(lambda o: o+1)
        c2 = case(2)(lambda o: 0)


    class cycle_4(cycle_3):
        c2 = case(2)(lambda o: 3)
        c3 = case(3)(lambda o: 0)
    
    k = 0
    for i in range(100):
        assert i%3 == k
        k = cycle_3(k)
    
    k = 0
    for i in range(100):
        assert i%4 == k
        k = cycle_4(k)
    
