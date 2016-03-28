
import random
from itertools import chain

# A bunch of recognizable names
names = ["jos", "maria", "anthony", "jeroen", "stijn", "evert", "sam",
         "pieter", "oscar", "jef", "magda", "alfred", "amber", "bert",
         "boris", "brenda", "berta", "charles", "cato", "dries", "donald", 
         "eva", "ewout", "elke", "emma", "edgar", "fanny", "frodo", "floris", 
         "gert", "griet", "gandalf", "hendrik", "hans", "hagrid", "harry",
         "ingrid", "irene", "jan", "julie", "joris", "klaas", "kurt", "karen",
         "lander", "maarten", "nana", "nero", "olga", "rik", "sara", "sander",
         "sofie", "tom", "walter", "wim"]

class MockDataHolder:
    pass

mockdata = {}

do_print = True

def _print(*args, **kwargs):
    if do_print:
        print("#", *args, **kwargs)

class MetaMock(type):
    pass

class Mock(metaclass=MetaMock):
    def __init__(self, overrides={}, name=None, dct={}, parent=None):
        global mockdata
        md = MockDataHolder()
        if name is None:
            md.name = "{" + random.choice(names) + "}"
        else:
            md.name = name
        md.overrides = overrides
        md.dct = dct
        md.parent = parent
        mockdata[id(self)] = md
    
    def __call__(self, *args, **kwargs):
        global mockdata
        md = mockdata[id(self)]
        s = "{} called with: ({})".format(repr(self),
            ", ".join(chain([repr(a) for a in args],
                  [k+"="+repr(v) for (k,v) in kwargs.items()])))
        _print(s)
    
    def __repr__(self):
        md = mockdata[id(self)]
        s = "\x1b[1;38;2;0;255;255m{}\x1b[0m".format(md.name)
        if md.parent is not None:
            return repr(md.parent) + "." + s
        return s
    
    def __str__(self):
        md = mockdata[id(self)]
        if md.parent is not None:
            return str(md.parent) + "." + md.name
        return md.name
    
    def __getattr__(self, name):
        global mockdata
        md = mockdata[id(self)]
        
        s = "{} getting attribute \x1b[1;38;2;0;255;0m`{}`\x1b[0m".format(repr(self), name)
        if name in md.overrides:
            result = md.overrides[name]
            s += ' \x1b[1;38;2;255;0;0m(overriden)\x1b[0m'
        else:
            result = Mock(name=name, parent=self)
            md.overrides[id(md)] = result
        _print(s)
        return result
    
    def __getitem__(self, key):
        global mockdata
        md = mockdata[id(self)]
        s = "{} getting item \x1b[1;38;2;0;255;0m`{}`\x1b[0m".format(repr(self), key)
        if key in md.dct:
            result = md.dct[key]
            s += ' \x1b[1;38;2;255;0;0m(found)\x1b[0m'
        else:
            result = Mock(name="["+str(key)+"]", parent=self)
            md.dct[id(md)] = result
        _print(s)
        return result
    
    def __setitem__(self, key, val):
        global mockdata
        md = mockdata[id(self)]
        s = "{} setting item \x1b[1;38;2;0;255;0m`{}`\x1b[0m to {}".format(repr(self), key, val)
        if key in md.dct:
            md.dct[key] = val
        else:
            md.dct[key] = val
            s += ' \x1b[1;38;2;255;0;0m(not initially found)\x1b[0m'
        _print(s)
    
    def __await__(self):
        global mockdata
        md = mockdata[id(self)]
        #_print("{} __await__ returned".format(repr(self)))
        if "__await__" in md.overrides:
            yield from md.overrides["__await__"](self)
        return self.awaited
        yield
    
