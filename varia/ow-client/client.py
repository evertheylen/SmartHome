#!/bin/python3

# === Configuration ========================

basename = "localhost"
#basename = "jarvis.ydns.eu"
ws_url = "ws://"+basename+":8888/ws"
post_url = "http://"+basename+":8888/add_data"
filename = "config.json"

def get_value():
    return random.random() * 5

# ==========================================

import sys
import json
from getpass import getpass
import random
from urllib.parse import urlencode

import tornado
import tornado.websocket
import tornado.ioloop
from tornado.options import define, options, parse_command_line
from tornado.httpclient import AsyncHTTPClient, HTTPRequest

basename = sys.argv[0]
ioloop = tornado.ioloop.IOLoop.instance()

helptext = """
OverWatch client
================

Usage:
    {basename}              Search for the file '{filename}' and run.
    {basename} config       Log in and generate '{filename}'.
    {basename} help         Show this help.

You will need to be registered on OverWatch.

""".format(**locals())

def main():
    try:
        if len(sys.argv) > 1:
            if sys.argv[1] == "config":
                ioloop.run_sync(config)
            elif sys.argv[1].endswith("help") or sys.argv[1] == "-h":
                print(helptext)
            else:
                print("I don't understand that. Here's the help text:")
                print(helptext)
        else:
            run()
    except KeyboardInterrupt:
        ioloop.stop()
        print("Stopping...")
    except Closed:
        ioloop.stop()
        print("Connection was closed")


# Config
# ======

# We stay in contact with the backend through the normal websocket connection

def type_input(msg, cls, retry="Please try again."):
    while True:
        try:
            inp = input(msg)
            result = cls(inp)
            return result
        except ValueError:
            print(retry)


class Closed(Exception):
    def __str__(self):
        return "The connection was closed."

class SimpleConn:
    def __init__(self, ws):
        self.ws = ws
    
    async def send(self, msg):
        msg["ID"] = 1234
        self.ws.write_message(json.dumps(msg))
        resp = await self.ws.read_message()
        if resp is None:
            raise Closed()
        else:
            return json.loads(resp)

async def connect():
    ws = await tornado.websocket.websocket_connect(ws_url)
    return SimpleConn(ws)


async def config():
    cfg = {}
    try:
        conn = await connect()
    except:
        print("Could not connect to {}.".format(ws_url))
        return
    
    # User auth
    
    print("Please log in to OverWatch.")
    
    while True:
        email = input("Email: ")
        password = getpass()
        
        resp = await conn.send({
            "type": "login",
            "data": {"email": email, "password": password},
        })
        
        if resp["data"]["status"] == "success":
            UID = resp["data"]["user"]["UID"]
            del password  # Yeah, security!
            print("Logged in. Your UID is {}.\n".format(UID))
            break
        else:
            if resp["data"]["reason"] == "email_unknown":
                print("Wrong email, try again.")
            elif resp["data"]["reason"] == "wrong_password":
                print("Wrong password, try again.")
            else:
                print("Something went wrong, try again.")
    
    cfg["UID"] = UID
    
    # Pick a sensor
    
    resp = await conn.send({
        "type": "get_all",
        "what": "Sensor",
        "for": {"what": "User", "UID": UID}
    })
    
    sensors = {s["SID"]: s for s in resp["data"]}
    if len(sensors) == 0:
        print("I couldn't find any sensors! Please add some through the web interface.")
        return
    else:
        print(" SID | Type        | Title ")
        print("-----+-------------+-------")
        l = list(sensors.values())
        for s in l:
            print(" {s[SID]:<3} | {s[type]:<11} | {s[title]}".format(s=s))
        print("")
        while True:
            try:
                inp = input("Pick a sensor [{}]: ".format(l[0]["SID"]))
                if inp == "":
                    SID = l[0]["SID"]
                else:
                    SID = int(inp)
                break
            except ValueError:
                print("Wrong input, try again.")
    
    cfg["SID"] = SID
    
    # Getting secret key of sensor
    
    resp = await conn.send({
        "type": "get_secret_key",
        "data": {"SID": SID}
    })
    secret_key = resp["data"]["secret_key"]
    cfg["secret_key"] = secret_key
    print("Got secret key from server.\n")
    
    cfg["period"] = type_input("After how many seconds should we send a value? ", float)
    
    with open(filename, 'w') as outfile:
        print("\nSaving generated config...")
        json.dump(cfg, outfile)


# Running
# =======

# We use simple POST requests to add our data


def run():
    client = AsyncHTTPClient()
    
    try:
        with open(filename, 'r') as infile:
            cfg = json.load(infile)
    except FileNotFoundError:
        print("Could not find file '{}'. Perhaps you should run `{} config` first?".format(filename, basename))
        return
    
    async def submit_value():
        val = get_value()
        post_data = {"SID": cfg["SID"], "secret_key": cfg["secret_key"], "value": val}
        resp = await client.fetch(HTTPRequest(url=post_url, method="POST", body=urlencode(post_data)))
        print("Submitted {}.".format(val))
        
    period = cfg["period"]
    sched = tornado.ioloop.PeriodicCallback(submit_value, period*1000, io_loop=ioloop)
    print("Starting scheduler, submitting value every {} ".format(period) + ("second" if period==1 else "seconds"))
    sched.start()
    ioloop.start()
    

if __name__ == "__main__":
    main()
