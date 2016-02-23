
import json

class Base:
    json_props = []
    
    def to_dict(self):
        dct = {}
        for p in self.json_props:
            dct[p] = self.__dict__[p]
        return dct
    
    def to_json(self):
        return json.dumps(self.to_dict())
