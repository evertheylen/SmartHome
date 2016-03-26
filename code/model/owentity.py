
import sparrow
from util.exceptions import *


class OwEntity(sparrow.Entity):
    __no_meta__ = True
    
    async def is_authorized(self, type: str, usr: "User", **kwargs):
        """Override me!"""
        return True
    
    async def check_auth(self, req: "Request", **kwargs):
        """Use me when doing stuff!"""
        if not (await self.is_authorized(req.metadata["type"], req.conn.user, **kwargs)):
            raise Authentication("auth", "No access for this object", "{} tried and failed to access {}".format(usr, self))
        
class RTOwEntity(OwEntity, sparrow.RTEntity):
    __no_meta__ = True

