
# Standard library
import os
import logging

# Own code
from controller import *
from database import *
from handlers import *
from model import *

# Tornado
import tornado.ioloop
import tornado.web
from tornado.options import define, options, parse_command_line

# CLI arguments
define("port", default=8888, help="run on the given port", type=int)
define("debug", default=True, help="run in debug mode")

def localdir(location):
    return os.path.join(os.path.dirname(__file__), location)
# TODO close the ioLoop properly so no errors occur when KeyboardInterrupt occurs
class OverWatch():
    def __init__(self, tornado_app_settings={}):
        # Logging support
        self.logger = logging.getLogger("OverWatch")
        self.logger.setLevel(logging.DEBUG if options.debug else logging.INFO)
        # HOW TO LOG:
        self.logger.debug("OverWatch initialized")
        # Or use one of these functions: info, warn, error, critical

        # The view/presentation layer are the Handlers, so it's kinda the 'app' provided by Tornado.
        # Every handler will get a reference to the controller
        self.controller = Controller(self.logger, None, None)

        # The model is pretty self-explanatory
        # The database is not managed by the model, but it's not a big deal really.
        # It could be managed by the model, but I prefer to keep the model clean of that.
        self.model = Model(self.logger, self.controller)

        # Now of course, set the controllers references too.
        self.controller.model = self.model
        self.controller.db = Database(self.logger)
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
        self.app = tornado.web.Application(
            [   # Enter your routes (regex -> Handler class) here! Order matters.
                (r'/html/(.*)', tornado.web.StaticFileHandler, {'path': localdir("html")}),
                (r'/js/(.*)', tornado.web.StaticFileHandler, {'path': localdir("js")}),
                (r'/static/(.*)', tornado.web.StaticFileHandler, {'path': localdir("static")}),
                (r"/ws", create_WsHandler(self.controller)),
                (r"/(.*)", create_MainHandler(self.controller)),
            ],
            **tornado_app_settings
        )

    def run(self):
        self.logger.info("Starting OverWatch on: http://localhost:%d/"%options.port)
        self.app.listen(options.port)
        tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    parse_command_line()
    # run it!
    ow = OverWatch()
    try:
        ow.run()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.current().stop()
        ow.logger.info("Stopping because of KeyboardInterrupt")
