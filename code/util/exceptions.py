
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

    def json_repr(self):
        return {"short": self.short, "long": self.long}

# More finetuning

class Authentication(Error):
    pass

class NotFound(Error):
    pass
