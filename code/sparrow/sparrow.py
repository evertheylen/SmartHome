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

import psycopg2
import momoko

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
            yield c.create_table_command
    
    async def install(self):
        # Set up database, only once for each "install" of the app
        for c in self.classes:
            await c.create_table_command.exec(self.db)
            
    async def uninstall(self, code):
        # Very brutal operation, therefore has some extra protection
        if encode(code) == 'FgvwaUrrsgTrraFznnx':
            for c in self.classes:
                await c.drop_table_command.exec(self.db)
        
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

# Decorators

# I don't know a good way of creating both an async version and a synchr version with the same code...
# Until then, sorry for the double code.

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

# cursor has the following methods:
# cursor.__class__(         cursor.__format__(        cursor.__le__(            
# cursor.__delattr__(       cursor.__ge__(            cursor.__lt__(            
# cursor.__dir__(           cursor.__getattribute__(  cursor.__ne__(            
# cursor.__doc__            cursor.__gt__(            cursor.__new__(           
# cursor.__enter__(         cursor.__hash__(          cursor.__next__(          
# cursor.__eq__(            cursor.__init__(          cursor.__reduce__(        
# cursor.__exit__(          cursor.__iter__(          cursor.__reduce_ex__(     
# cursor.__repr__(          cursor.callproc(          cursor.copy_to(           
# cursor.__setattr__(       cursor.cast(              cursor.description        
# cursor.__sizeof__(        cursor.close(             cursor.execute(           
# cursor.__str__(           cursor.closed             cursor.executemany(       
# cursor.__subclasshook__(  cursor.connection         cursor.fetchall(          
# cursor.arraysize          cursor.copy_expert(       cursor.fetchmany(         
# cursor.binary_types       cursor.copy_from(         cursor.fetchone(          
# cursor.itersize           cursor.rowcount           cursor.string_types
# cursor.lastrowid          cursor.rownumber          cursor.typecaster
# cursor.mogrify(           cursor.scroll(            cursor.tzinfo_factory(
# cursor.name               cursor.scrollable         cursor.withhold
# cursor.nextset(           cursor.setinputsizes(     
# cursor.query              cursor.setoutputsize(     
# cursor.row_factory        cursor.statusmessage


class SqlResult:
    def __init__(self, cursor, cmd):
        self.cursor = cursor
        self.cmd = cmd

    def single(self):
        assert self.cursor.rowcount == 1, "More than 1 result"
        return self.cmd.cls(db_args=self.cursor.fetchone())
        
    def all(self):
        return [self.cmd.cls(db_args=t) for t in self.cursor.fetchall()]
    
    def amount(self, i):
        return [self.cmd.cls(db_args=t) for t in self.cursor.fetchmany(size=i)]
    
    def scroll(self, i):
        """scroll is chainable"""
        self.cursor.scroll(i)
        return self
    
    def count(self):
        return self.cursor.rowcount

# How to do SQL?

# Example:
# u = (await User.get(User.mail == UnsafeWrap(usermail)).exec(db)).single()
# 
# Shorter example:
# u = await User.get(User.mail == UnsafeWrap(usermail)).single(db)

# users_query = User.get(User.mail == Field("mail")).compile()
# ...
# result = await users_query.with_data(mail = usermail).exec()
# users = result.all()

# query = User.raw("SELECT * FROM table_User WHERE UID = %(name)s")
# Or if you don't like pyformat:
# query = User.raw("SELECT * FROM table_User WHERE UID = {0}".format(Field("name")))
# u = query.with_data(name = "evert").single(db)

def wrapper_sqlresult(method):
    @wraps(method)
    async def wrapper(self, db, *args, **kwargs):
        result = await self.exec(db)
        return method(result, *args, **kwargs)
    return wrapper

class Sql:
    def __init__(self, data = {}):
        self.data = data
    
    # All of them expect a database and will (if needed) first 'compile'
    # your AbstractSql.
    @async_first_compile
    async def exec(self, db):
        return SqlResult(await db.get_cursor(self.text, self.data), self)
    
    # Allows you to call these method immediatly on a statement:
    
    single = wrapper_sqlresult(SqlResult.single)
    all = wrapper_sqlresult(SqlResult.all)
    count = wrapper_sqlresult(SqlResult.count)
    
    def with_data(self, **kwargs):
        """This function creates a copy of the statement with added data."""
        newself = self.copy()
        newself.data.update(kwargs)
        return newself
    
    def copy(self):
        return copy.deepcopy(self)
    
    @first_compile
    def __str__(self):
        return self.text

class RawSql(Sql):
    def __init__(self, text, cls, data = {}):
        self.text = text
        Sql.__init__(self, cls, data)
    
    def copy(self):
        # Yay performance
        return RawSql(self.text, self.cls, copy.copy(self.data))

class AbstractSqlStatement(SqlStatement, SqlPart):
    """
    Base class for all SQL Statement classes.
    """
    def __init__(self, cls, data={}):
        SqlStatement.__init__(self, cls, data)
    
    def to_raw(self, text):
        return RawSqlStatement(text, self.cls, self.data)
        
    def check(self, part):
        if isinstance(part, SqlPart):
            

sql_select_from_template = """
SELECT * FROM {tname}
"""
    
class Where(SqlPart):
    def __init__(self, lfield, op, rfield, data={}):
        SqlPart.__init__(self, data)
        self.lfield = lfield
        self.op = op
        self.rfield = rfield
        self.check_unsafe_wrap(self.lfield, self.rfield)
    
    def __str__(self):
        return "{s.lfield} {s.op} {s.rfield}".format(s=self)

class Select(AbstractSqlStatement):
    """
    Mainly for SELECT statements.
    """
    def __init__(self, cls, where_clauses=[], order=None, offset=0, limit=None):
        AbstractSqlStatement.__init__(self, cls)
        self.where_clauses = [self.check(c) for c in where_clauses]
        self.order = self.check(order)
        self.offset = self.check(offset)
        self.limit = self.check(limit)
        
    def limit(self, l):
        self.limit = l
        return self
    
    def offset(self, o):
        self.offset = o
        return self
    
    def where(self, clause):
        self.where_clauses.append(clause)
        self.
        return self
    

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

def create_where_comparison(op):
    def method(self, other):
        return Where(self, op, other)
    return method

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
        self.dataname = None  # Idem, where to find the actual stored data inside an object
        self.cls = None  # Idem
    
    def to_sql(self):
        return "\t{s.name}\t{s.sql_type} {s.sql_extra}".format(s=self) + (" NOT NULL" if self.required else "")
    
    def __str__(self):
        return self.cls._table_name + "." + self.name
    
    __lt__ = create_where_comparison("<")
    __gt__ = create_where_comparison(">")
    __le__ = create_where_comparison("<=")
    __ge__ = create_where_comparison(">=")
    __eq__ = create_where_comparison("=")
    __ne__ = create_where_comparison("!=")
    
class Key:
    """
    A reference to other properties that define the key of this object.
    """
    def __init__(self, *args):
        self.props = args
    
    def key_props(self):
        yield from self.props

class KeyProperty(Key, Property):
    """
    A specifically created property to be used as a key.
    Type in postgres is SERIAL.
    """
    def __init__(self):
        Property.__init__(self, int, sql_type="SERIAL", sql_extra="PRIMARY KEY", required=False)
        
    def key_props(self):
        yield self

class Reference:
    pass
    # TODO

class MetaEntity(type):
    # Thanks to http://stackoverflow.com/a/27113652/2678118
    
    @classmethod
    def __prepare__(self, name, bases):
        return collections.OrderedDict()

    def __new__(self, name, bases, dct):
        dct['__ordered_props__'] = [k for (k, v) in dct.items()
                if isinstance(v, Property) and not k == "key"]
        
        if not("__no_meta__" in dct and dct["__no_meta__"] == True):
            props = []
            
            init_properties = []  # holds (sparrow.Property, property(fget, fset))
            for k in dct['__ordered_props__']:
                p = dct[k]
                if isinstance(p, Property):
                    # Set some stuff of properties that are not known at creation time
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
                        p.dataname = p.name
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
                        val = None
                        try:
                            val = kwargs[p.name]
                        except KeyError as e:
                            if p.required:
                                raise e
                            else:
                                val = None
                        if prop is not None:
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
        if not("__no_meta__" in dct and dct["__no_meta__"] == True):
            cls.create_table_command = CreateTable(cls)
            cls.drop_table_command = DropTable(cls)
            
            # set more stuff of properties that isn't known at creation time
            for p in cls._props:
                p.cls = cls
            
        super(MetaEntity, cls).__init__(name, bases, dct)
 

class Entity(metaclass=MetaEntity):
    __no_meta__ = True
    
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
    
    constraints = []  # TODO
    json_props = []  # TODO

    @classmethod
    def raw(cls, text):
        return RawSqlStatement(text, cls)
    
    @classmethod
    def get(cls, *where_clauses):
        # TODO actually handle where_clauses
        return Select(cls)
    
    #@classmethod
    #def get_by_key(cls, key):
        # heavy TODO
    
    def to_json(self):
        return json.dumps(self.json_repr())
    
    def json_repr(self):
        d = {}
        for p in self.json_props:
            d[p.name] = self.__dict__[p.dataname]
        return d
    
    # Methods:
    #   - put, update, delete

    # Preprocessing in MetaEntity!

class RTEntity(Entity):
    __no_meta__ = True
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

# Stuff
# ----------------------------------------------------


if __name__ == "__main__":
    print(text)
    print("Soon there will be some tests here")
