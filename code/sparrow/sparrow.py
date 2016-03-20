text = r"""
 
             .-----.  __  .-----------
            / /     \(..)/    -----
           //////   ' \/ `   ---
          //// / // :    : ---
         // /   /  /`    '--
        //          //..\\
  @================UU====UU================@
  |                '//||\\`                |
  |                   ''                   |
  |             S P A R R O W              |
  |                                        |
  |   Single Page Application Real-time    |
  |                                        |
  |       Relational Object Wrapper        |
  |                                        |
  @========================================@
    
"""
 
import collections
import datetime
import copy
from functools import wraps
import itertools
import json
# This is some serious next-level stuff :D
import weakref

from .util import *

# Exceptions

class PropertyConstraintFail(Error):
    def __init__(self, obj, prop):
        self.obj = obj
        self.prop = prop
    
    def __str__(self):
        return "Constraint of property {s.prop} of object {s.obj} failed".format(s=self)

class ObjectConstraintFail(Error):
    def __init__(self, obj):
        self.obj = obj
    
    def __str__(self):
        return "Object-wide constraint of object {s.obj} failed".format(s=self)



# Central classes
# ---------------------------------------------------

# Wow very security (import this :P)

d = {}
for c in (65, 97):
    for i in range(26):
        d[chr(i+c)] = chr((i+13) % 26 + c)

def encode(s):
    return "".join([d.get(c, c) for c in s])

class SparrowApp:
    """
    The central class that keeps everything together.
    """
    def __init__(self, logger, ioloop, classes, debug=True):
        self.logger = logger
        self.db = Database(ioloop)
        self.debug = debug
        self.ioloop = ioloop
        self.classes = classes
        
        if debug:
            # Keeps track of all SQL statements
            self.sql_statements = set()
    
    def add_nontrivial_sql_statement(self, stat):
        self.sql_statements.add(stat)
    
    def all_sql_statements(self):
        yield from self.sql_statements
        for c in self.classes:
            yield c._create_table_command
            yield c._drop_table_command
    
    async def install(self):
        # Set up database, only once for each "install" of the app
        for c in self.classes:
            await c._create_table_command.exec(self.db)
            
    async def uninstall(self, code):
        # Very brutal operation, therefore has some extra protection
        if encode(code) == 'FgvwaUrrsgTrraFznnx':
            for c in self.classes:
                await c._drop_table_command.exec(self.db)
        
    def info(self):
        for s in self.all_sql_statements():
            print(str(s))
            print("\n----------------\n")


# After dabbling with the idea of global variables, it won't happen.

