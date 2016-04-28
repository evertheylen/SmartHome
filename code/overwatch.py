#!/usr/bin/env python3.5

import sys
import os

def localdir(location):
    return os.path.join(os.path.dirname(__file__), location)

# Sparrow!
try:
    import sparrow
except ImportError:
    codedir = os.path.dirname(__file__)
    sys.path.append(codedir)
    libsdir = os.path.join(codedir, "libs")
    for p in os.listdir(libsdir):
        sys.path.append(os.path.join(libsdir, p))
    import sparrow

# Standard library
import logging
import types
from functools import wraps

# Tornado
import tornado.ioloop
import tornado.web
from tornado.options import parse_command_line

import schedule

# Own code
import controller
import handlers
import model

import time
os.environ['TZ'] = 'Europe/London'
time.tzset()


# Parse config
# ============

default_config = {
    "port": 8888,
    "debug": True,
    "database": {
        "dbname": "overwatchdb",
        "user": "postgres",
        "password": "postgres",
        "host": "localhost",
        "port": 5432,
    },
    "tornado_app_settings": {}
}

def parse_config(conf, default):
    d = {}
    for (k,v) in default.items():
        if k in conf:
            if isinstance(v, dict):
                d[k] = parse_config(conf[k], v)
            else:
                d[k] = conf[k]
        else:
            d[k] = v
    return d

def get_config(filename="config.py"):
    if os.path.isfile(filename):
        with open(filename) as f:
            code = compile(f.read(), filename, 'exec')
            glob = {}
            loc = {}
            exec(code, glob, loc)
            return parse_config(loc["config"], default_config)
    else:
        print("WARNING: Using default config. A `config.py` file can change this. (See overwatch.py for template).")
        return default_config


class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')


# OverWatch central class
# =======================

ioloop = tornado.ioloop.IOLoop.current()

def simple_async_catch(method):
    @wraps(method)
    async def wrapper(self):
        try:
            await method(self)
        except sparrow.Error as e:
            self.logger.error(str(e))
    return wrapper

class OverWatch:    
    def __init__(self, config, ioloop=ioloop):
        self.config = config
        self.ioloop=ioloop
        
        # Logging support
        self.logger = logging.getLogger("OverWatch")
        self.logger.setLevel(logging.DEBUG if config["debug"] else logging.INFO)
        # HOW TO LOG:
        self.logger.debug("OverWatch initialized")
        # Or use one of these functions: info, warn, error, critical

        # The view/presentation layer are the Handlers, so it's kinda the 'app' provided by Tornado.
        # Every handler will get a reference to the controller
        self.controller = controller.Controller(self.logger, None)

        # The model is pretty self-explanatory
        # The database is not managed by the model, but it's not a big deal really.
        # It could be managed by the model, but I prefer to keep the model clean of that.
        self.model = sparrow.SparrowModel(ioloop, db_args=config["database"], debug=config["debug"],
            classes=model.social_pre + model.base + model.social)

        # Now of course, set the controllers references too.
        self.controller.model = self.model
        # The controller does not initially have any references to the "view" minions (ie. handlers),
        # In a classical app, it does not need too. In our app however, we need two-way communication.
        # However, WebsocketHandlers will signal a new connection to the controller, and the controller
        # will maintain that list.

        # This is the Tornado Application. "But wait, it's an object! No subclassing? And what about
        # those weird functions create_...Handler?"
        # You may expect an important class like an 'Application' to subclassed into our own application.
        # However, the way Tornado works it that it only requires some settings and routes for an app,
        # there is no real reason to subclass this, you can make this work with an instance just as well.
        # The Handlers are at the entire different end of the 'instance <-> class' spectrum though. They
        # are instantiated for every request! Because we still need them to be able to communicate with
        # the Controller, we wrap the class in a function that binds the controller to them, and returns
        # that class.
        tornado_app_settings = config["tornado_app_settings"]
        if config["debug"] and "autoreload" not in tornado_app_settings:
            tornado_app_settings["autoreload"] = True

        self.app = tornado.web.Application(
            [   # Enter your routes (regex -> Handler class) here! Order matters.
                (r'/html/(.*)', NoCacheStaticFileHandler, {'path': localdir("html")}),
                (r'/js/(.*)', NoCacheStaticFileHandler, {'path': localdir("js")}),
                (r'/static/(.*)', NoCacheStaticFileHandler, {'path': localdir("static")}),
                (r"/ws", handlers.create_WsHandler(self.controller, config["debug"])),
                (r"/debug", handlers.create_DebugHandler(self.controller)),
                (r"/upload", handlers.create_UploadHandler(self.controller)),
                (r"/getconfig", handlers.create_GetConfigHandler(self.controller)),
                (r"/(.*)", handlers.create_MainHandler(self.controller)),
            ],
            **tornado_app_settings
        )

    # Actions
    # -------
    
    def cleanup(self):
        self.logger.info("Cleanup!")
        ioloop.spawn_callback(model.Value.clean, self.model.db)
    
    def run(self):
        schedule.every().day.at("23:55").do(self.cleanup)
        self.logger.info("Starting OverWatch on: http://localhost:%d/"%self.config["port"])
        self.app.listen(self.config["port"])
        self.ioloop.start()
    
    @simple_async_catch
    async def install(self):
        self.logger.info("Installing...")
        await self.model.install()
    
    @simple_async_catch
    async def uninstall(self):
        self.logger.info("Uninstalling...")
        await self.model.uninstall()
    
    @simple_async_catch
    async def reinstall(self):
        self.logger.info("Reinstalling...")
        await self.model.uninstall()
        await self.model.install()
    
    def sql_info(self):
        self.model.sql_info()
    
    def json_info(self):
        self.model.json_info()
    

def unknown_action(_logger):
    def f(logger=_logger):
        logger.info("I don't know that action.")
    return f


# Main
# ====

if __name__ == "__main__":
    # For some reason this gives me a colored log, WTF
    # Not actually used though
    parse_command_line()
    
    config = get_config()
    ow = OverWatch(config)
    action = "run" if len(sys.argv) == 1 else sys.argv[1]
    try:
        f = getattr(ow, action, unknown_action(ow.logger))()
        if isinstance(f, types.CoroutineType):
            async def await_f(): await f
            ioloop.run_sync(await_f)
    except KeyboardInterrupt:
        ioloop.stop()
        ow.logger.info("Stopping because of KeyboardInterrupt")
