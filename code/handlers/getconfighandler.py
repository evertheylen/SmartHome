
import json

import tornado

from model import *
from util import sim

# Handlers are instantiated for every request!
def create_GetConfigHandler(controller):
    # TODO cache html/index.html
    class GetConfigHandler(tornado.web.RequestHandler):
        async def get(self, *args):
            user = await controller.get_user(self.get_cookie("session"))
            controller.logger.info("Session is " + str(self.get_cookie("session")))
            if user is None:
                self.write("Please log in")
                return
            controller.logger.info("Creating config for user", user.UID)
            config = []
            locations = await Location.get(Location.user == user.key).all(controller.db)
            for l in locations:
                config.append(await sim.create_elecsim_config(l, controller.db))
            self.set_header("Content-Type", 'application/json; charset="utf-8"')
            self.write(json.dumps(config, indent=4))

    return GetConfigHandler
