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


# Important stuff so Sparrow doesn't do stuff it shouldn't
own_bases = []
def add_base(clsname):
    global own_bases
    own_bases.append(clsname)
    
    
import collections
import datetime
import copy
from functools import wraps
import itertools

import psycopg2
import momoko

# Central classes
# ---------------------------------------------------

# Wow very security

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
            yield c.create_table_command
    
    async def install(self):
        # Set up database, only once for each "install" of the app
        for c in self.classes:
            await c.create_table_command.execute(self.db)
            
    async def uninstall(self, code):
        # Very brutal operation, therefore has some extra protection
        if encode(code) == 'FgvwaUrrsgTrraFznnx':
            for c in self.classes:
                await c.drop_table_command.execute(self.db)
        
    
    def info(self):
        for s in self.sql_statements:
            print(str(s))
            print("\n----------------\n")


# After dabbling with the idea of global variables, it won't happen.

# Database stuff
# ---------------------------------------------------

# Classes

class Database:
    def __init__(self, ioloop):
        dsn = "dbname=testdb user=postgres password=postgres host=localhost port=5432"
        self.pdb = momoko.Pool(dsn=dsn, size=5, ioloop=ioloop)
        self.pdb.connect()

    async def get_cursor(self, statement, unsafe_dict):
        statement = str(statement)
        cursor = await self.pdb.execute(statement, unsafe_dict)
        return cursor

# Unsafe data, to be formatted by psycopg2
class UnsafeWrap:
    def __init__(self, value):
        self.key = str(id(self))
        self.text = "%({0})s".format(self.key)
        self.value = value
    
    def __str__(self):
        return self.text

# Unsafe data not yet decided
class Field:
    def __init__(self, name):
        self.text = "%({0})s".format(name)
    
    def __str__(self):
        return self.text

# Statements etc

# Decorator first_compile
# This is a way of providing all functions to both Abstract and Raw so the client does
# not have to worry about compiling queries. Basically, mark a method with it in 
# SqlStatement, and you are guaranteed that self becomes a RawSqlStatement.
def async_first_compile(method):
    @wraps(method)
    async def wrapper(self, *args, **kwargs):
        if isinstance(self, AbstractSqlStatement):
            self = self.compile()
        return await method(self, *args, **kwargs)
    return wrapper

def first_compile(method):
    @wraps(method)
    def wrapper(self, *args, **kwargs):
        if isinstance(self, AbstractSqlStatement):
            self = self.compile()
        return method(self, *args, **kwargs)
    return wrapper

def async_filter_unsafe_wraps(method):
    @wraps(method)
    async def wrapper(self, *args, **kwargs):
        for a in itertools.chain(args, kwargs.values()):
            if isinstance(a, UnsafeWrap):
                self.data[a.key] = a.value
        return await method(self, *args, **kwargs)
    return wrapper

def filter_unsafe_wraps(method):
    @wraps(method)
    def wrapper(self, *args, **kwargs):
        for a in itertools.chain(args, kwargs.values()):
            if isinstance(a, UnsafeWrap):
                self.data[a.key] = a.value
        return method(self, *args, **kwargs)
    return wrapper

class SqlStatement:
    def __init__(self, cls, data = {}):
        self.cls = cls
        self.data = data
    
    # fetchone, fetchall, count, execute, ...
    # All of them expect a database and will (if needed) first 'compile'
    # your AbstractSqlStatement.
    @async_first_compile
    async def fetchone(self, db):
        cursor = await db.get_cursor(self.text, self.data)
        assert(cursor.rowcount == 1)
        return cursor.fetchone()
    
    @async_first_compile
    async def execute(self, db):
        cursor = await db.get_cursor(self.text, self.data)
        return
    
    def insert_data(self, **kwargs):
        self.data.update(kwargs)
        return self
    
    @first_compile
    def __str__(self):
        return self.text

class RawSqlStatement(SqlStatement):
    def __init__(self, text, cls, data = {}):
        self.text = text
        SqlStatement.__init__(self, cls, data)
    

class AbstractSqlStatement(SqlStatement):
    """
    Base class for all SQL Statement classes.
    """
    def __init__(self, cls, data={}):
        SqlStatement.__init__(self, cls, data)
    
    def to_raw(self, text):
        return RawSqlStatement(text, self.cls, self.data)
    
    
sql_select_from_template = """
SELECT * FROM {tname}
"""

class Select(AbstractSqlStatement):
    """
    Mainly for SELECT statements.
    """
    # TODO

class Command(AbstractSqlStatement):
    """
    For INSERT, DELETE, UPDATE statements.
    """
    # TODO


sql_create_table_template = """
CREATE TABLE {tname} (
{props}
); 

"""

sql_drop_table_template = """
DROP TABLE {tname};
"""

class CreateTable(Command):
    """
    For CREATE TABLE statements.
    """
    def __init__(self, cls):
        self.tname = cls._table_name
        self.props = cls._props
        Command.__init__(self, cls)
    
    def compile(self):
        return self.to_raw(sql_create_table_template.format(
            tname = self.tname,
            props = ",\n".join([p.to_sql() for p in self.props])
        ))

class DropTable(Command):
    def __init__(self, cls):
        self.tname = cls._table_name
        Command.__init__(self, cls)
    
    def compile(self):
        return self.to_raw(sql_drop_table_template.format(
            tname = self.tname
        ))

class Insert(Command):
    """
    For INSERT statements.
    """
    # TODO

class Update(Command):
    """
    For UPDATE statements.
    """
    # TODO

class Delete(Command):
    """
    For DELETE statements.
    """
    # TODO




# Entity stuff
# ---------------------------------------------------

class Property:
    default_sqltypes = {
        int: "INT",
        str: "VARCHAR",
        float: "REAL",
        bool: "BOOL",
        datetime.datetime: "TIMESTAMP"  # but consider perhaps amount of milliseconds since UNIX epoch
    }
    
    def __init__(self, typ, sql_type=None, constraints = [], sql_extra = "", required = True):
        if sql_type is None:
            sql_type = Property.default_sqltypes[typ]
        self.type = typ
        self.sql_type = sql_type
        self.constraints = constraints
        self.sql_extra = sql_extra
        self.required = required
        self.name = None  # Set by the metaclass
        self.dataname = None  # Idem
    
    def to_sql(self):
        return "\t{s.name}\t{s.sql_type} {s.sql_extra}".format(s=self) + (" NOT NULL" if self.required else "")

class Key:
    """
    A reference to other properties that define the key of this object.
    """
    def __init__(self, *args):
        self.props = args

class KeyProperty(Key, Property):
    """
    A specifically created property to be used as a key.
    Type in postgres is SERIAL.
    """
    def __init__(self):
        Property.__init__(self, int, sql_type="SERIAL", sql_extra="PRIMARY KEY", required=False)

class MetaEntity(type):
    # Thanks to http://stackoverflow.com/a/27113652/2678118
    
    @classmethod
    def __prepare__(self, name, bases):
        return collections.OrderedDict()

    def __new__(self, name, bases, dct):
        dct['__ordered_props__'] = [k for (k, v) in dct.items()
                if isinstance(v, Property) and not k == "key"]
        
        if not(dct["__module__"] == __name__ and name in own_bases):
            props = []
            
            init_properties = []  # holds (sparrow.Property, property(fget, fset))
            for k in dct['__ordered_props__']:
                p = dct[k]
                if isinstance(p, Property):
                    # Set names of properties
                    p.name = k
                    props.append(p)
                    
                    if len(p.constraints) > 0:
                        p.dataname = "_data_" + p.name
                        # REMINDER: You must wrap p in a default argument, otherwise
                        # it will bind to the last value p holds in this loop
                        def getter(self, _p = p):
                            return self.__dict__[_p.dataname]
                        
                        def setter(self, val, _p = p):
                            if not isinstance(val, _p.type):
                                raise Exception("Not right type")
                            for c in _p.constraints:
                                if not c(val):
                                    raise Exception("Constraint not met")
                            self.__dict__[_p.dataname] = val
                        prop = property(getter, setter)
                        dct[p.name] = prop
                        init_properties.append((p, prop))
                    else:
                        init_properties.append((p, None))
            
            def __init__(obj, in_db=False, db_args=None, **kwargs):
                if db_args is not None:
                    # Init from a simple list/tuple
                    # TODO incomplete initializing!
                    for (i, (p, prop)) in enumerate(init_properties):
                        if prop is None:
                            obj.__dict__[p.name] = db_args[i]
                        else:
                            val = db_args[i]
                            for c in p.constraints:
                                if not c(val):
                                    raise Exception("Constraint not met")
                            obj.__dict__[p.dataname] = val
                else:
                    for (p, prop) in init_properties:
                        if prop is None:
                            try:
                                obj.__dict__[p.name] = kwargs[p.name]
                            except KeyError as e:
                                if p.required:
                                    raise e
                                else:
                                    obj.__dict__[p.name] = None
                        else:
                            val = None
                            try:
                                val = kwargs[p.name]
                            except KeyError as e:
                                if p.required:
                                    raise e
                                else:
                                    val = None
                            for c in p.constraints:
                                if not c(val):
                                    raise Exception("Constraint not met")
                            obj.__dict__[p.dataname] = val
                    
            dct["__init__"] = __init__
                        
            dct["_props"] = props
            
            assert "key" in dct, "Each class must have a key"
            dct["_incomplete"] = isinstance(dct["key"], KeyProperty)
            
            dct["_table_name"] = "table_" + name
            
            # Generate queries for:
            #   - put
            #   - update
            #   - delete
            #   - create_table_command
            
            dct["create_table_command"] = None
            dct["drop_table_command"] = None
        
        return type.__new__(self, name, bases, dct)
    
    def __init__(cls, name, bases, dct):
        if not(cls.__module__ == __name__ and name in own_bases):
            cls.create_table_command = CreateTable(cls)
            cls.drop_table_command = DropTable(cls)
        super(MetaEntity, cls).__init__(name, bases, dct)
 

class Entity(metaclass=MetaEntity):
    add_base("Entity")
    
    # __init__ constructed in metaclass
    
    def put(self):
        assert(not self.in_db)
        
        
    def update(self):
        assert(self.in_db)
        
        
    def delete(self):
        if self.in_db:
            # TODO
            pass
    
    def add_listener(self, conn):
        pass
    
    def remove_listener(self, conn):
        pass
    
    def remove_all_listeners(self):
        pass
    
    constraints = []
    json_props = []

    # Methods:
    #   - __init__
    #   - put, update, delete
    #   - to_json, json_repr
    #   - from_db

    # Classmethods:
    #   - get, get_by_key
    #   - create_table_command
    
    # Preprocessing in MetaEntity!
    pass

class RTEntity(Entity):
    add_base("RTEntity")
    cache = {}
    
    def __init__(self, *args, **kwargs):
        super(RTEntity, self).__init__(*args, **kwargs)
        self._listeners = set()
    
    def add_listener(self, conn):
        self._listeners.add(conn)
        conn.add_listenee(self)
    
    def remove_listener(self, conn):
        if conn in self._listeners:
            self._listeners.remove(conn)
            conn.remove_listenee(self)
    
    def remove_all_listeners(self):
        for conn in self._listeners:
            self._listeners.remove(conn)
            conn.remove_listenee(self)

