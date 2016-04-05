
class Error(Exception):
    """
    Base class for OverWatch exceptions.
    """
    
    def __init__(self, short, long, backend_msg="..."):
        self.short = short
        self.long = long
        self.backend_msg = backend_msg
        
    def __str__(self):
        return "[{s.short}: {s.long}] {s.backend_msg}".format(s=self)
    
    __repr__ = __str__
    
    def json_repr(self):
        return {"short": self.short, "long": self.long}

# More finetuning

class Authentication(Error):
    pass

class NotFound(Error):
    # Not very descriptive, because the existence of a row might give
    # away information. See model.owentity.ExistenceIsBool.
    def __init__(self, backend_msg="..."):
        super(NotFound, self).__init__("not_found", "The object you requested was not found.",
                                       backend_msg=backend_msg)

        
