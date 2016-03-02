
from . import Base, create_table_template, property_template
from collections import OrderedDict

class Value(Base):
    def __init__(self, SID, time, value):
        self.SID = SID
        self.time = time
        self.value = value
    
    def to_dict(self):
        return [self.time, self.value]
    
    @classmethod
    def create_table_command(cls):
        props = ",\n".join([property_template.format(n, t) for (n, t) in cls.db_props.items()]
                           + ["    PRIMARY KEY (SID, time)"])
        return create_table_template.format(props=props, tname=cls.table_name)
    
    @classmethod
    async def new(cls, db, dct):
        db_insert_props = list(cls.db_props.keys())
        tupl = await db.insert(cls.table_name, db_insert_props, list(dct.values()), "*")
        u = cls(**dct)
        u.post_from_db(dct)
        return u

    # TODO see base.py (delete on object)
    @classmethod
    async def delete(cls, db, ID):
        await db.delete(cls.table_name, cls.db_key, ID)
        return cls.db_key
    

    @classmethod
    async def get(cls, db, ID):
        result = await db.get(cls.table_name, cls.db_key, ID)
        return cls.from_db(result)

    @classmethod
    async def get_all(cls, db):
        result = await db.get_all(cls.table_name, cls.db_key)
        return [cls.from_db(tupl) for tupl in result]
    
    def __eq__(self, other):
        return type(self) == type(other) and all([self.__dict__[k] == other.__dict__[k] for k in self.db_key])
    
    def __hash__(self):
        return hash(Value) + sum([hash(self.__dict__[k]) for k in self.db_key])
    
    db_props = OrderedDict([
                ("SID", "INT REFERENCES Sensors"),
                ("time", "TIMESTAMP"),
                ("value", "DOUBLE PRECISION")])

    db_key = ("SID", "time")
    table_name = "Values"

