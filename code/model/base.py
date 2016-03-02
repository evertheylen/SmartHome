
import json

create_table_template = """
CREATE TABLE {tname} (
{props}
);
"""

property_template = "    {0}\t{1}"

# The __init__ function is as extensive as possible
# However, it is only used by the from_json and from_db methods.
# These methods insert their arguments as kwargs.
# All arguments that are not necessary the database need a default.
# After calling the __init__, fromDB will call post_from_db(tuple).

class Base:
    json_props = []

    def post_from_db(self, tupl):
        pass


    @classmethod
    def create_table_command(cls):
        props = ",\n".join([property_template.format(n, t) for (n, t) in cls.db_props.items()])
        return create_table_template.format(props=props, tname=cls.table_name)

    
    """
    @classmethod
    def fromJSON(cls, json_str):
        dct = json.loads(json_str)
        init_dct = {key: dct[val] for key in cls.json_props}
        obj = cls(**init_dct)
        obj.post_fromJSON(dct)
        return obj

    def post_fromJSON(self, dct):
        pass
    """

    @classmethod
    def from_db(cls, tupl):
        init_dct = {key: tupl[i] for (i, (key, _)) in enumerate(cls.db_props.items())}
        obj = cls(**init_dct)
        obj.post_from_db(tupl)
        return obj

    async def set(self, db, prop, val):
        self.__dict__[prop] = val
        await db.update(self.table_name, [prop], [val], self.db_key, self.__dict__[self.db_key])

    async def set_multi(self, db, dct):
        for (k,v) in dct.items():
            self.__dict__[k] = v
        await db.update(self.table_name, list(dct.keys()), list(dct.values()), self.db_key, self.__dict__[self.db_key])

    # TODO more performance if done on metaclass level
    @classmethod
    async def new(cls, db, dct):
        db_insert_props = [prop for prop in cls.db_props.keys() if prop != cls.db_key]
        tupl = await db.insert(cls.table_name, db_insert_props, [dct[k] for k in db_insert_props], cls.db_key)
        dct[cls.db_key] = tupl[0]
        u = cls(**dct)
        u.post_from_db(dct)
        return u

    @classmethod
    async def delete(cls, db, ID):
        await db.delete(cls.table_name, cls.db_key, ID)
        return cls.db_key

    # TODO execute delete on an object instead of the class, also for Values

    @classmethod
    async def get(cls, db, ID):
        result = await db.get(cls.table_name, cls.db_key, ID)
        # TODO handle error when result is None
        return cls.from_db(result)

    @classmethod
    async def get_all(cls, db):
        result = await db.get_all(cls.table_name, cls.db_key)
        # TODO handle error when result is None 
        return [cls.from_db(tupl) for tupl in result]

    def to_dict(self):
        dct = {}
        for p in self.json_props:
            dct[p] = self.__dict__[p]
        return dct

    def to_json(self):
        return json.dumps(self.to_dict())
    
    # Hashing and equality
    def __eq__(self, other):
        return type(self) == type(other) and self.__dict__[self.db_key] == other.__dict__[other.db_key]
    
    def __hash__(self):
        return hash(self.__class__) + hash(self.__dict__[self.db_key])
    
