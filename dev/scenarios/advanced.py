
#shell()
while True:
    r = wait(".*")
    if r["type"] == "login":
        r.answer({"type": "login", "data": {"session": 123}})
    elif r["type"] == "signup":
        r.answer({"type": "signup", "data": "success"})
        '''
r = wait("signup")
r.answer({"type": "signup", "data": "success"})

r = wait("login")
r.answer({"type": "login", "data": {"session": 123}})

for i in range(3):
    r = wait(".*")  # regexes!
    r.answer({"type": r["type"], "data": {"i": i}})  # ID of answer is automatically inserted

r = wait("login")
r.answer({"type": "login", "data": {"session": 123}})

import time
time.sleep(1)  # Again, it's still just Python

shell()

send({"type": "message", "data": {"content": "Hello world"}})  # sending a message'''
