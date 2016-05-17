
from sparrow import *

from .owentity import *
from .wall import Wall


class User(RTOwEntity):
    key = UID = KeyProperty()
    # TODO reconsider excessive constraints on length?
    first_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    last_name = Property(str, constraint=lambda p: 1 <= len(p) <= 100)
    password = Property(str, constraint=lambda p: 8 <= len(p) <= 100, json=False)
    email = Property(str, constraint=lambda p: 1 <= len(p) <= 100, sql_extra="UNIQUE")
    admin = Property(bool)

    # Social stuff
    wall = Reference(Wall)

    async def insert(self, db, *args, **kwargs):
        from .livegraph import LiveGraph, create_WhereInGraphLive
        res = await super(User, self).insert(db, *args, **kwargs)
        default_graphs = [
            ("Average electricity usage from today", "electricity"),
            ("Average gas usage from today", "gas"),
            ("Average water usage from today", "water"),
            ("Average values of other sensors from today", "other")
        ]
        for title, vtype in default_graphs:
            lg = LiveGraph(timespan_start=-24*60*60*1000, timespan_end=0, timespan_valuetype="HourValue", title=title, user=self.key)
            wheres = [create_WhereInGraphLive("user_UID", "eq", self.UID)]
            group_by = [{"what": "Type", "IDs": [vtype]}]
            await lg.build(wheres, group_by, db)
            await lg.save(db)
        
        return res
        
    def __str__(self):
        try:
            return "User({})".format(self.email)
        except:
            return "some User"
