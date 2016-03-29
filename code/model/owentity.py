
import sparrow
from util.exceptions import *
import types

class OwEntity(sparrow.Entity):
    __no_meta__ = True
    
    def is_authorized(self, type: str, usr: "User", **kwargs):
        """Override me!"""
        return True
    
    async def check_auth(self, req: "Request", **kwargs):
        """Use me when doing stuff!"""
        res = self.is_authorized(req.metadata["type"], req.conn.user, **kwargs)
        if isinstance(res, types.CoroutineType):
            res = await res
        if not res:
            raise Authentication("auth", "No access for this object", "{} tried and failed to access {}".format(req.conn.user, self))
        
class RTOwEntity(OwEntity, sparrow.RTEntity):
    __no_meta__ = True

