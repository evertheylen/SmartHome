
# This document is just python

r = wait("signup")
print("type is", r["type"])  # it is possible to use the actual message
r.answer({"type": "signup", "data": {"session": "123"}})  # ID of answer is automatically inserted
        
import time
time.sleep(1)  # Again, it's still just Python

send({"type": "message", "data": {"content": "Hello world"}})  # sending a message
