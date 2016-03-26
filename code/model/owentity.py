
import sparrow
from util.exceptions import *


class OwEntity(sparrow.Entity):
    __no_meta__ = True
    
    def is_authorized(self, type, usr):
        """Override me!"""
        return True
    
    def check_auth(self, type, usr):
        """Use me when doing stuff!"""
        if not self.is_authorized(type, usr):
            raise Authentication("auth", "No access for this object", "{} tried and failed to access {}".format(usr, self))
        
class RTOwEntity(OwEntity, sparrow.RTEntity):
    __no_meta__ = True

