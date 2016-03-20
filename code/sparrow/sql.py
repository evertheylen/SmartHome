
from functools import wraps

import psycopg2
import momoko

from .util import *

# Database stuff
# ---------------------------------------------------

# Exception

class SqlError(Error):
    def __init__(self, err, query, data):
        self.err = err
        self.query = query
        self.data = data
        
    def __str__(self):
        return "While executing this SQL:\n{s.query}\nWith this data:{data}\nThis exception occured:{s.err}".format(
            s = self, data = repr(self.data))

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
# cursor.nextset(           cursor.setininsertsizes(     
# cursor.query              cursor.setoutinsertsize(     
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
        try:
            return SqlResult(await db.get_cursor(str(self), self.data), self)
        except psycopg2.Error as e:
            raise SqlError(e, str(self), self.data)
    
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

class Order(Sql):  # TODO order on multiple attributes (might work already?)
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

class EntityCommand(Command):
    def __preinit__(self, what):
        Sql.__preinit__(self)
        if isinstance(what, type):
            # an Insert that needs to be filled later on
            self.cls = what
        else:
            self.cls = type(what)
            for p in self.cls._complete_props:
                self.data[p.name] = what.__dict__[p.dataname]
        

class Insert(EntityCommand):
    def __init__(self, what, returning=None):
        EntityCommand.__preinit__(self, what)
        self._returning = self.check(returning)
        Command.__init__(self, self.cls)
    
    def returning(self, prop):  # TODO return multiple attributes?
        self._returning = prop
        return self
    
    def __str__(self):
        s = "INSERT INTO {cls._table_name} ({props}) VALUES({vals})".format(
            cls = self.cls,
            props = ", ".join([p.name for p in self.cls._complete_props]),
            vals = ", ".join(["%("+p.name+")s" for p in self.cls._complete_props])
        )
        if self._returning is not None:
            s += " RETURNING " + str(self._returning)
        return s
    

class Update(EntityCommand):
    def __init__(self, what):
        EntityCommand.__preinit__(self, what)
        EntityCommand.__init__(self, self.cls)
    
    def __str__(self):
        return "UPDATE {cls._table_name} SET ({props}) = ({vals}) WHERE {cls.key} = ({keyvals})".format(
            cls = self.cls,
            props = ", ".join([p.name for p in self.cls._complete_props]),
            vals = ", ".join(["%("+p.name+")s" for p in self.cls._complete_props]),
            keyvals = ", ".join(["%("+p.name+")s" for p in self.cls.key.referencing_props()])
        )

class Delete(Command):
    def __init__(self, what):
        EntityCommand.__preinit__(self, what)
        EntityCommand.__init__(self, self.cls)
    
    def __str__(self):
        return "DELETE FROM {cls._table_name} WHERE {cls.key} = ({keyvals})".format(
            cls = self.cls,
            keyvals = ", ".join(["%("+p.name+")s" for p in self.cls.key.referencing_props()])
        )

