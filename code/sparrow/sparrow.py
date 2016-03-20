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

import pdb

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
class Unsafe:
    def __init__(self, value):
        self.key = str(id(self))
        self.text = "%({0})s".format(self.key)
        self.value = value
    
    def __str__(self):
        return self.text

# Unsafe data not yet decided
# Kinda useless but still :P
class Field:
    def __init__(self, name):
        self.text = "%({0})s".format(name)
    
    def __str__(self):
        return self.text

# Statements etc

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
    
    def raw(self):
        return self.cursor.fetchone()
    
    def single(self):
        assert self.cursor.rowcount == 1, "Not 1 result but {} result(s).".format(self.cursor.rowcount)
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
        if hasattr(self, "data"):
            self.data.update(data)
        else:
            self.data = data
    
    def __preinit__(self):
        self.data = {}
    
    # By default, there is no class
    cls = None
    
    async def exec(self, db):
        return SqlResult(await db.get_cursor(str(self), self.data), self)
    
    # Allows you to call these method immediatly on a statement:
    single = wrapper_sqlresult(SqlResult.single)
    all = wrapper_sqlresult(SqlResult.all)
    amount = wrapper_sqlresult(SqlResult.amount)
    count = wrapper_sqlresult(SqlResult.count)
    raw = wrapper_sqlresult(SqlResult.raw)
    
    def with_data(self, **kwargs):
        """This function creates a copy of the statement with added data."""
        newself = self.copy()
        newself.data.update(kwargs)
        return newself
    
    # By default simply create a deepcopy
    def copy(self):
        return copy.deepcopy(self)
    
    def check(self, what):
        if isinstance(what, Sql):
            self.data.update(what.data)
            return what.to_raw()
        elif isinstance(what, Unsafe):
            self.data[what.key] = what.value
        elif isinstance(what, Field):
            return str(what)
        elif isinstance(what, tuple):
            l = []
            for t in what:
                l.append(self.check(t))
            return tuple(l)
        return what
    
    def to_raw(self):
        return RawSql(str(self), self.data)
    
    def __str__(self):
        return "undefined so far"

class ClassedSql(Sql):
    def __init__(self, cls, data={}):
        self.cls = cls
        Sql.__init__(self, data)
    
    def to_raw(self):
        return RawClassedSql(self.cls, str(self), self.data)

class RawSql(Sql):
    def __init__(self, text, data = {}):
        self.text = text
        Sql.__init__(self, data)
    
    def to_raw(self):
        return self
    
    def copy(self):
        # Yay performance
        return RawSql(self.text, copy.copy(self.data))
    
    def __str__(self):
        return self.text

class RawClassedSql(RawSql, ClassedSql):
    def __init__(self, cls, text, data = {}):
        # TODO possibly make this use super but I suspect it will fuck around
        self.cls = cls
        self.text = text
        Sql.__init__(self, data)
    
    def copy(self):
        return RawClassedSql(self.cls, self.text, copy.copy(self.data))


class Where(Sql):
    def __init__(self, lfield, op, rfield, data={}):
        Sql.__preinit__(self)
        self.lfield = self.check(lfield)
        self.op = op
        self.rfield = self.check(rfield)
        Sql.__init__(self, data)
    
    def __str__(self):
        return "{s.lfield} {s.op} {s.rfield}".format(s=self)

class Order(Sql):  # TODO order on multiple attributes
    def __init__(self, field, op, data={}):
        Sql.__preinit__(self)
        self.field = self.check(field)
        self.op = op
        Sql.__init__(self, data)
        
    def __str__(self):
        return "{s.field} {s.op}".format(s=self)

class Select(ClassedSql):
    def __init__(self, cls, where_clauses=[], order=None, offset=None, limit=None):
        Sql.__preinit__(self)
        self.where_clauses = [self.check(c) for c in where_clauses]
        self._order = self.check(order)
        self._offset = self.check(offset)
        self._limit = self.check(limit)
        ClassedSql.__init__(self, cls)
        
    # returning self permits chaining
    
    def limit(self, l):
        self._limit = l
        return self
    
    def offset(self, o):
        self._offset = o
        return self
    
    def where(self, *clauses):
        self.where_clauses.extend(clauses)
        return self
    
    def order(self, _order):
        if not isinstance(_order, Order):
            _order = +_order
        self._order = _order
        return self
    
    def __str__(self):
        s = "SELECT * FROM {cls._table_name}".format(cls=self.cls)
        if len(self.where_clauses) > 0:
            s += " WHERE " + " AND ".join(["("+str(c)+")" for c in self.where_clauses])
        if self._order is not None:
            s += " ORDER BY {}".format(self._order)
        if self._limit is not None:
            s += " LIMIT {}".format(self._limit)
        if self._offset is not None:
            s += " OFFSET {}".format(self._offset)
        return s
    

class Command(ClassedSql):
    """
    For INSERT, DELETE, UPDATE statements.
    """
    pass


sql_create_table_template = """
CREATE TABLE {tname} (
{stuff}
); 
"""

class CreateTable(Command):
    """
    For CREATE TABLE statements.
    """
    def __init__(self, cls):
        Command.__init__(self, cls)
    
    def __str__(self):
        return sql_create_table_template.format(
            tname = self.cls._table_name,
            stuff = ",\n".join([p.sql_def() for p in self.cls._props]
                               + [r.sql_constraint() for r in self.cls._refs]
                               + [self.cls.key.sql_constraint()])
        )

class DropTable(Command):
    def __init__(self, cls):
        Command.__init__(self, cls)
        self.tname = cls._table_name
    
    def __str__(self):
        return "DROP TABLE IF EXISTS {tname} CASCADE".format(
            tname = self.tname
        )

class Insert(Command):
    def __init__(self, what, returning=None):
        Sql.__preinit__(self)
        if isinstance(what, type):
            # an Insert that needs to be filled later on
            self.cls = what
        else:
            self.cls = type(what)
            for p in self.cls._complete_props:
                self.data[p.name] = what.__dict__[p.dataname]
        
        self.props = self.cls._complete_props
        self.returning = self.check(returning)
        Command.__init__(self, self.cls)
    
    def returning(self, prop):  # TODO return multiple attributes?
        self.returning = prop
        return self
    
    def __str__(self):
        s = "INSERT INTO {cls._table_name} ({props}) VALUES({vals})".format(
            cls = self.cls,
            props = ", ".join([p.name for p in self.props]),
            vals = ", ".join(["%("+p.name+")s" for p in self.props])
        )
        if self.returning is not None:
            s += " RETURNING " + str(self.returning)
        return s
    

class Update(Command):
    # TODO
    pass

class Delete(Command):
    # TODO
    pass




# Entity stuff
# ---------------------------------------------------

def create_where_comparison(op):
    def method(self, other):
        return Where(self, op, other)
    return method

def create_order(op):
    def method(self):
        return Order(self, op)
    return method

class Queryable:
    __lt__ = create_where_comparison("<")
    __gt__ = create_where_comparison(">")
    __le__ = create_where_comparison("<=")
    __ge__ = create_where_comparison(">=")
    __eq__ = create_where_comparison("=")
    __ne__ = create_where_comparison("!=")
    
    __pos__ = create_order("ASC")
    __neg__ = create_order("DESC")


class Property(Queryable):
    default_sqltypes = {
        int: "INT",
        str: "VARCHAR",
        float: "DOUBLE PRECISION",
        bool: "BOOL",
        datetime.datetime: "TIMESTAMP"  # but consider perhaps amount of milliseconds since UNIX epoch
    }
    
    def __init__(self, typ, sql_type=None, constraint = None, sql_extra = "", required = True, json = True):
        if sql_type is None:
            sql_type = Property.default_sqltypes[typ]
        self.type = typ
        self.sql_type = sql_type
        self.constraint = constraint
        self.sql_extra = sql_extra
        self.required = required
        self.json = json
        self.name = None  # Set by the metaclass
        self.dataname = None  # Idem, where to find the actual stored data inside an object
        self.cls = None  # Idem
    
    def sql_def(self):
        return "\t" + self.name + " " + self.type_sql_def()
    
    def type_sql_def(self):
        return self.sql_type + (" " + self.sql_extra if self.sql_extra != "" else "") + (" NOT NULL" if self.required else "")
    
    def __str__(self):
        return self.cls._table_name + "." + self.name
    

class Key(Queryable):
    """
    A reference to other properties that define the key of this object.
    """
    def __init__(self, *props):
        self.props = props
        self.single_prop = None
    
    def __postinit__(self):
        newprops = []
        for p in self.props:
            if isinstance(p, Reference):
                newprops.extend(p.props)
                assert len(p.props) >= 1
            else:
                newprops.append(p)
        self.props = newprops
        assert len(self.props) >= 1
        if len(self.props) == 1:
            self.single_prop = self.props[0]
            self.__class__ = SingleKey

    def referencing_props(self):
        yield from self.props
    
    def sql_constraint(self):
        return "\tPRIMARY KEY " + str(self)
    
    def __str__(self):
        return "({keys})".format(keys=", ".join([p.name for p in self.referencing_props()]))
    
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return tuple([obj.__dict__[p.dataname] for p in self.referencing_props()])
    
    def __set__(self, obj, val):
        if obj is not None:
            for (i, p) in enumerate(self.referencing_props()):
                if p.constraint is not None and not p.constraint(val):
                    raise Exception("Constraint not met")
                obj.__dict__[p.dataname] = val[i]
    
    def __delete__(self, obj):
        pass  # ?

class SingleKey(Key):
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return obj.__dict__[self.single_prop.dataname]
    
    def __set__(self, obj, val):
        if obj is not None:
            if self.single_prop.constraint is not None and not self.single_prop.constraint(val):
                raise Exception("Constraint not met")
            obj.__dict__[self.single_prop.dataname] = val
    
    def __delete__(self, obj):
        pass  # ?

class KeyProperty(SingleKey, Property):
    """
    A specifically created property to be used as a key.
    Type in postgres is SERIAL.
    """
    def __init__(self):
        Property.__init__(self, int, sql_type="SERIAL", required=False)
        self.single_prop = self
    
    def __postinit__(self):
        pass
    
    def referencing_props(self):
        yield self
        
    def sql_constraint(self):
        return "\tPRIMARY KEY (" + self.name + ")"
    
    __str__ = Property.__str__
        

class Reference(Queryable):
    def __init__(self, ref):
        self.ref = ref
        self.ref_props = list(ref.key.referencing_props())
        assert len(self.ref_props) >= 1
        self.props = []
        self.single_prop = None
        self.name = None  # Set by metaclass
    
    def __postinit__(self):  # called by metaclass
        for rp in self.ref_props:
            p = Property(rp.type, rp.sql_type if not rp.sql_type == "SERIAL" else "INT")
            p.cls = rp.cls
            p.name = self.name + "_" + rp.name
            p.dataname = self.name + "_" + rp.dataname
            self.props.append(p)
        assert len(self.props) >= 1
        if len(self.props) == 1:
            self.single_prop = self.props[0]
            self.__class__ = SingleReference
    
    def sql_constraint(self):
        """Will only generate the SQL constraint. The metaclass will take care of the properties."""
        return "\tFOREIGN KEY ({own_props}) REFERENCES {ref_name}".format(
            own_props=", ".join([p.name for p in self.props]),
            ref_name=self.ref._table_name,
        )
    
    def __str__(self):
        return "(" + ", ".join([str(p) for p in self.props]) + ")"
    
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return tuple([obj.__dict__[p.dataname] for p in self.props])
    
    def __set__(self, obj, val):
        if obj is not None:
            for (i, p) in enumerate(self.props):
                try:
                    obj.__dict__[p.dataname] = val[i]
                except:
                    pdb.set_trace()
    
    def __delete__(self, obj):
        pass  # ?

class SingleReference(Reference):
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return obj.__dict__[self.single_prop.dataname]
    
    def __set__(self, obj, val):
        # References can not be constrained
        if obj is not None:
            obj.__dict__[self.single_prop.dataname] = val
    
    def __delete__(self, obj):
        pass  # ?
    
    def __str__(self):
        return str(self.single_prop)


# This is a better way of doing things than python's native property
class ConstrainedProperty(Property):
    # No init, just hack around it by setting __class__
    
    # Descriptor stuff? Anyway it works :P
    
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        return obj.__dict__[self.dataname]
    
    def __set__(self, obj, val):
        if obj is not None:
            if not self.constraint(val):
                raise Exception("Constraint not met")
            obj.__dict__[self.dataname] = val
    
    def __delete__(self, obj):
        pass  # ?


class MetaEntity(type):
    # Thanks to http://stackoverflow.com/a/27113652/2678118
    
    @classmethod
    def __prepare__(self, name, bases):
        return collections.OrderedDict()

    def __new__(self, name, bases, dct):
        ordered_props = [k for (k, v) in dct.items()
                if isinstance(v, Property) and not k == "key"]
        
        ordered_refs = [k for (k, v) in dct.items()
                if isinstance(v, Reference)]
        
        ordered_keys = [k for (k, v) in dct.items()
                if isinstance(v, Key)]
        
        if not("__no_meta__" in dct and dct["__no_meta__"] == True):
            props = []
            
            init_properties = []
            json_props = []
            for k in ordered_props:
                p = dct[k]
                # Set some stuff of properties that are not known at creation time
                p.name = k
                props.append(p)
                if p.json:
                    json_props.append(p)
                
                if p.constraint is not None:
                    p.dataname = "_data_" + p.name
                    p.__class__ = ConstrainedProperty  # woohoo HACK
                    init_properties.append((p,True))
                else:
                    p.dataname = p.name
                    init_properties.append((p,False))
                        
            dct["_props"] = props
            dct["_json_props"] = json_props
            
            refs = []
            init_ref_properties = []
            init_raw_ref_properties = []
            for k in ordered_refs:
                r = dct[k]
                r.name = k
                r.__postinit__()
                refs.append(r)
                props.extend(r.props)
                init_raw_ref_properties.extend(r.props)
                init_ref_properties.append(r)
            
            dct["_refs"] = refs
            
            def __init__(obj, in_db=False, db_args=None, **kwargs):
                obj.in_db = in_db
                if db_args is not None:
                    # Init from a simple list/tuple
                    # TODO incomplete initializing!
                    start = 0
                    for (i, (p, constrained)) in enumerate(init_properties):
                        val = db_args[i]
                        if constrained and (not p.constraint(val)):
                            raise Exception("Constraint not met")
                        obj.__dict__[p.dataname] = val
                    for (i, p) in enumerate(init_raw_ref_properties, len(init_properties)):
                        obj.__dict__[p.dataname] = db_args[i]
                else:
                    for (p, constrained) in init_properties:
                        val = None
                        try:
                            val = kwargs[p.name]
                        except KeyError as e:
                            if p.required:
                                raise e
                            else:
                                val = None
                        if constrained and (not p.constraint(val)):
                            raise Exception("Constraint not met")
                        obj.__dict__[p.dataname] = val
                    for r in init_ref_properties:
                        r.__set__(obj, kwargs[r.name])
                    
            dct["__init__"] = __init__
            
            assert "key" in dct, "Each class must have a key"
            the_key = dct["key"]
            the_key.__postinit__()
            dct["_incomplete"] = isinstance(the_key, KeyProperty)
            
            dct["_complete_props"] = [p for p in props if not isinstance(p, KeyProperty)]
            
            dct["_table_name"] = "table_" + name
            
            # Generate queries for:
            #   - put
            #   - update
            #   - delete
            #   - create_table_command
            
            dct["_create_table_command"] = None
            dct["_drop_table_command"] = None
            dct["_put_command"] = None
        
            cls = type.__new__(self, name, bases, dct)
            
            for p in props:
                p.cls = cls
            
            cls._create_table_command = CreateTable(cls).to_raw()
            cls._drop_table_command = DropTable(cls).to_raw()
            if cls._incomplete:
                cls._put_command = Insert(cls, returning=cls.key).to_raw()
            else:
                cls._put_command = Insert(cls).to_raw()
        else:
            cls = type.__new__(self, name, bases, dct)
        return cls
 

class Entity(metaclass=MetaEntity):
    __no_meta__ = True
    
    # __init__ constructed in metaclass
    
    async def put(self, db):
        assert(not self.in_db)
        cls = type(self)
        dct = {}
        for p in self._complete_props:
            dct[p.name] = self.__dict__[p.dataname]
        insert = cls._put_command.with_data(**dct)
        if cls._incomplete:
            result = await insert.raw(db)
            self.__dict__[cls.key.dataname] = result[0]
        else:
            await insert.exec(db)
        self.in_db = True
    
    
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
    
    constraint = None  # TODO

    @classmethod
    def raw(cls, text):
        return RawSqlStatement(text, cls)
    
    @classmethod
    def get(cls, *where_clauses):
        return Select(cls, where_clauses)
    
    #@classmethod
    #def get_by_key(cls, key):
        # heavy TODO
    
    def to_json(self):
        return json.dumps(self.json_repr())
    
    def json_repr(self):
        d = {}
        for p in self._json_props:
            d[p.name] = self.__dict__[p.dataname]
        return d
    
    # Methods:
    #   - update, delete

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
