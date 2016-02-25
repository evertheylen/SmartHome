
import json

create_table_template = """
CREATE TABLE {tname} (
{props}
);
"""

property_template = "    {0}\t{1}"

# The __init__ function is as extensive as possible
# However, it is only used by the fromJSON and fromDB methods.
# These methods insert their arguments as kwargs.
# All arguments that are not necessary the database need a default.
# After calling the __init__, fromDB will call post_fromDB(tuple).

class Base:
    json_props = []
    
    def post_fromDB(self, tupl):
        pass
    
    
    @classmethod
    def create_table_command(cls):
        props = ",\n".join([property_template.format(n, t) for (n, t) in cls.db_props.items()])
        return create_table_template.format(props=props, tname="py"+cls.__name__)
    
    
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
    def fromDB(cls, tupl):
        init_dct = {key: tupl[i] for (i, (key, _)) in enumerate(cls.db_props)}
        obj = cls(**init_dct)
        obj.post_fromDB(dct)
        return obj
    
    def to_dict(self):
        dct = {}
        for p in self.json_props:
            dct[p] = self.__dict__[p]
        return dct
    
    def to_json(self):
        return json.dumps(self.to_dict())
