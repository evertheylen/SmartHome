#!/usr/bin/env python3

"""
Interactive shell for OverWatch.
"""

import threading
from code import InteractiveConsole
import readline
import types
import pdb
import time
import readline
import rlcompleter
import os.path

from tornado.options import define, options, parse_command_line
import tornado.ioloop
import concurrent.futures

ioloop = tornado.ioloop.IOLoop.current()

from overwatch import *
from model import *
from controller import *
from handlers import *
from util import *
from util.mock import *

define("start", default=True, help="Automatically start the server", type=bool)
define("config", default="", help="Location of config file", type=str)

parse_command_line()

def await(func, *args, **kwargs):
    s = threading.Semaphore(0)
    val = {"result": None}
    async def wait_for_result(_func=func, _args=args, _kwargs=kwargs, _s=s, _val=val):
        try:
            if isinstance(_func, types.CoroutineType):
                _val["result"] = await _func
            else:
                res = _func(*_args, **_kwargs)
                if isinstance(res, types.CoroutineType):
                    _val["result"] = await res
                else:
                    _val["result"] = res
        finally:
            _s.release()
    ioloop.spawn_callback(wait_for_result)
    s.acquire()
    return val["result"]

def execute_snippet(location, console):
    with open(location, 'r') as f:
        code = f.readlines()
        for line in code:
            print("::: " + line)
            console.push(line)
        console.push('\n')

class TodoPointer:
    location = None

def shell_thread(**kwargs):
    hist_loc = ".overwatch_shell.history"
    console = InteractiveConsole()
    console.locals = locals()
    console.locals.update(kwargs)
    console.locals.update(globals())
    console.push("import sys")
    console.push("import os")
    console.push("sys.path.append(os.getcwd())")
    readline.set_completer(rlcompleter.Completer(console.locals).complete)
    readline.parse_and_bind("tab: complete")
    if not os.path.isfile(hist_loc):
        f = open(hist_loc, "x")
        f.write("\n")
        f.close()
    # readline.read_history_file(hist_loc)
    # Opens a Python shell

    todo = TodoPointer()

    def snip(location, _todo=todo):
        _todo.location = location

    console.locals["snip"] = snip

    buf = []
    def get_input(prompt):
        if len(buf) > 0:
            l = buf.pop(0)
            print("::: " + l.rstrip("\n"))
            return l
        else:
            return input(prompt)

    while True:
        try:
            c = get_input(">>> ")
            if (not c == ""):
                if console.push(c): # console.push(c) executes the string c in the console.
                                    # if it is True, it means it expects more input
                                    # (for example a function definition)
                    _input = ' '
                    totalcommand = ''
                    while _input!='':
                        _input = get_input('... ')
                        totalcommand += _input+'\n'
                    console.push(totalcommand)

                if todo.location is not None:
                    with open(todo.location, 'r') as f:
                        code = f.readlines()
                        buf.extend(code)
                        buf.append("")
                    todo.location = None
        except (EOFError, KeyboardInterrupt):
            print("\nShell ended.")
            break
        except Exception as e:
            console.showtraceback()
        readline.write_history_file(hist_loc)

def server_thread(ow: OverWatch):
    ow.run()

if __name__ == "__main__":
    config = get_config(options.config)
    config["tornado_app_settings"]["autoreload"] = False
    ow = OverWatch(config)

    server = threading.Thread(target=server_thread, args=(ow,))
    shell = threading.Thread(target=shell_thread, kwargs={"ow": ow})
    server.start()
    time.sleep(0.5)
    shell.start()
    shell.join()
    ioloop.stop()
    server.join()
