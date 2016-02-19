
# Fake DB
placeholder_data = {
    1: 12.85,
    2: 784.124,
    3: 78.4
}

class Database:
    def __init__(self):
        global database
        self.data = placeholder_data
    
    def update(self, ID, val):
        # Also creates
        self.data[ID] = val
    
    def insert(self, ID, val):
        self.data[ID] = val
    
    def delete(self, ID):
        self.data.remove(ID)
        
    def get_value(self, ID):
        return self.data[ID]
    
    def list_sensors(self):
        yield from self.data.items()

