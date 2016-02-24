
import os
import threading
import json
import re

from code import InteractiveConsole
import readline

import tornado
import tornado.websocket
import tornado.ioloop
import tornado.gen
import tornado.web

from tornado.options import define, options, parse_command_line

def localdir(location):
    return os.path.join(os.path.dirname(__file__), location)

# CLI arguments
define("port", default=8888, help="run on the given port", type=int)
define("serve_files", default=True, help="Also serve local files (makes the websocket server run on /ws)", type=bool)
define("location", default="./", help="Which local folder to use as server root", type=str)
define("scenario", help="What scenario to load?", type=str)

# Server stuff

request_buffer = None

class WsHandler(tornado.websocket.WebSocketHandler):
    request_counter = 1  # The state is for all instances the same
    clients = set()
    
    hook_re = ""
    hook_lock = None
    
    
    def open(self, *args):
        WsHandler.clients.add(self)
    
    def check_origin(self, origin):
        return True

    def close(self, *args):
        WsHandler.clients.remove(self)

    def on_message(self, message):
        if WsHandler.hook_lock is None:
            print("Got unexpected message: " + message)
            return
    
        global request_buffer
        try:
            dct = json.loads(message)
            if re.match(WsHandler.hook_re, dct["type"]):
                request_buffer = Request(self, dct["ID"], dct)
                hook_lock_copy = WsHandler.hook_lock
                hook_lock = None
                hook_lock_copy.release()
            else:
                print("Got unexpected type: %s"%dct["type"])
        except KeyError:
            print("Error while getting type or ID from message")
        except json.JSONDecodeError:
            print("Error while decoding message")
    
    def send_message(self, message):
        try:
            self.write_message(message)
        except tornado.websocket.WebSocketClosedError:
            pass
            
    
    @classmethod
    def set_hook(cls, regex, lock):
        cls.hook_re = regex
        cls.hook_lock = lock
    
    @classmethod
    def exec_on_all(cls, method, *args, **kwargs):
        to_remove = []
        for c in cls.clients:
            method(c, *args, **kwargs)
            if c._finished:  # TODO don't use this implementation detail?
                to_remove.append(c)
        
        for c in to_remove:
            WsHandler.clients.remove(c)
        

# --------------------------------------------------
# --- These functions are used in the scenario's ---


class Request:
    def __init__(self, respond_to, ID, raw_request):
        self.respond_to = respond_to
        self.ID = ID
        self.raw_request = raw_request
        
    def answer(self, dct):
        dct["ID"] = self.ID
        msg = json.dumps(dct)
        tornado.ioloop.IOLoop.current().spawn_callback(WsHandler.send_message, self.respond_to, msg)
    
    def __getitem__(self, key):
        return self.raw_request[key]
    
    def __setitem__(self, key, val):
        self.raw_request[key] = val


def send(dct):
    tornado.ioloop.IOLoop.current().spawn_callback(
        WsHandler.exec_on_all, WsHandler.send_message, json.dumps(dct))

def wait(regex):
    s = threading.Semaphore(value=0)
    tornado.ioloop.IOLoop.current().spawn_callback(WsHandler.set_hook, regex, s)
    s.acquire()
    assert(request_buffer is not None)
    return request_buffer


console = InteractiveConsole()
console.locals = locals()
def shell():
    # Opens a Python shell
    # For the record, this code is copied from Gegevensabstractie en structuren :)
    while True:
        try:
            c = input(">>> ")
            if console.push(c): # console.push(c) executes the string c in the console.
                                # if it is True, it means it expects more input (for example a function definition)
                _input = ' '
                totalcommand = ''
                while _input!='':
                    _input = input('... ')
                    totalcommand += _input+'\n'
                console.push(totalcommand)
        except (EOFError, KeyboardInterrupt):
            print("\nShell ended.")
            break
        except Exception as e:
            print('Error: %s'%e)
    

# --------------------------------------------------

def server_thread():
    # Executes the tornado stuff
    app = tornado.web.Application([
        (r'/ws', WsHandler), 
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': localdir(options.location)})
    ])
    print("Websocket server location = ws://localhost:%d/ws"%options.port)
    print("Also serving local files")
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

def exec_file(fname):
    f = open(fname)
    code = compile(f.read(), fname, "exec")
    exec(code, globals(), locals())


def interpreter_thread():
    # Executes the scenario
    exec_file(options.scenario)

if __name__ == "__main__":
    parse_command_line()
    if options.scenario is None:
        print("Please specify a scenario.")
    else:
        server = threading.Thread(target=server_thread)
        interpreter = threading.Thread(target=interpreter_thread)
        server.start()
        interpreter.start()
        interpreter.join()
        tornado.ioloop.IOLoop.current().stop()
        server.join()


