
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

class ExistenceIsBool:
    """This class is for tables for which almost all info is in fact the existence
    of a tuple with a given key or not. In this case, we don't want to throw an
    Authentication exception, as this is enough to differentiate between found and
    not found. Therefore, we throw the same error as get would when the auth check failed.
    """
    async def check_auth(self, req: "Request", **kwargs):
        res = self.is_authorized(req.metadata["type"], req.conn.user, **kwargs)
        if isinstance(res, types.CoroutineType):
            res = await res
        if not res:
            raise Authentication("auth", "No access for this object", "{} tried and failed to access {}".format(req.conn.user, self))
    
