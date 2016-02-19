
# If you don't know too much about multithreading/async programming, you may expect Tornado to
# be multithreaded, as in having the ability to run on multiple cores at the same time.
# This is not true, for a number of reasons: two important ones being that most code in webapps
# can be executed rather fast, so the overhead multithreading brings is considerable. Another
# reason is that Python isn't really made to do this. There exists something called the GIL
# (Global Interpreter Lock) which makes sure there's only one thread executing Python bytecode
# at the same time.

# For those reasons, Tornado is not multithreaded. It is however highly concurrent, which is
# often referred to as multiprogramming instead of multithreading. The 'engine' making sure
# it is still fast is called the IOLoop, which is a complex thing. Basically, when things block,
# it'll try running something else that has recently been unblocked. It does this very well,
# so well that it can be faster than multithreaded systems (where there is, for example, a single
# thread for each websocket connection). This IOLoop runs in only one thread or process for that
# matter.

# So, our RWLock does not have to be too complex, because the most irritating kind of race
# conditions does not occur. Unless you (explicitly) mark an operation as possibly blocking,
# the IOLoop will keep following the same path of execution. Coming from a C++ background, this
# means you don't need to mark variables as atomic<...> anymore.

# Why do we even need a rwlock then? Good question. Consider this usecase:
# - A user edits some data in the frontend, which triggers a message to be sent over the
#   websocket connection.
# - The server changes the value of that data in the database, and then wants to notify other
#   users of that change. It uses a dictionary that couples ID's with listeners, and so it
#   iterates over each of these connections and sends them the new info.
#   However, as this involves the websocket, the IOLoop may 'pause' your execution.
# - Meanwhile, a new user starts listening
# - The list is modified while iterating, the system crashes.
#   
# TODO: I'm not entirely sure of this yet, depending on how the system works this issue may
# be averted altogether.

# Some interesting links: https://github.com/tornadoweb/tornado/wiki/Threading-and-concurrency
