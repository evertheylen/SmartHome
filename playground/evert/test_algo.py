
class Dummy:
    pass

self = Dummy()
self.last_value = (20, -50)
#self.last_value_added = False

values = [(v, i*2) for (i, v) in enumerate([1,1,1,1,2,2,2,2,3,3,3,3,4,5,6,7,8,9,9,9])]

# 'compress' the values
interesting_values = []

if self.last_value is None:
    self.last_value = values[0]
    interesting_values.append(self.last_value)
    #self.last_value_added = True
    
for value in values:
    if value[0] != self.last_value[0]:
        # the value is different from before, so we add it
        #if not self.last_value_added:
            #interesting_values.append(self.last_value)
        self.last_value = value
        interesting_values.append(self.last_value)
        #self.last_value_added = True
    #elif value[1] > self.last_value[1]:
        ## We 'shift' the virtual
        #self.last_value = (self.last_value[0], value[1])
        #self.last_value_added = False

#if not self.last_value_added:
    #interesting_values.append(self.last_value)
    #self.last_value_added = True

print(interesting_values)
