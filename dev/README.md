# Usage

## fake_server

This script 'emulates' a websocket connection by using a given scenario. The scenarios are basically simple python
scripts with a few special commands/classes:

  - `r = wait(type_regex)`: Waits for a message (from the frontend) matching the type_regex. Returns a `Request` object.
  - With `type(r) == Request`:
    - `r.answer(dct)`: Responds (only to the sender of the request) to a request by converting the dictionary `dct` to JSON. Also inserts the Request ID.
    - `r[key]`: The value stored in the request. For example, `r["type"]` will give the type of the request.
  - `send(dct)`: Sends the JSON representation of dct to all connected clients.
  - `shell()`: Runs a python shell with access to all of the above. Control+D or Control+C will stop the shell.
  
The script runs the server and the scenario in separate threads and makes sure the server doesn't block although the scenario does. All websocket connections share the same scenario, so disconnecting and reconnecting is not a problem. When connecting from multiple clients this may give unexpected behaviour though, so it is preferred to use this script with only one websocket client.

Options of the script:

    --serve-files                    Also serve local files (default True)
    --location                       Which local folder to use as server root (default ./)
    --port                           run on the given port (default 8888)
    --scenario                       What scenario to load? (filename required)
    
There are no special checks like the script below. It also doesn't log everything like the script below.

Examples can be found in ./dev/scenarios, execute them as follows:

    python3 fake_server.py --scenario=scenarios/simple.py

To stop a scenario during execution, press Control+C twice. Sorry, it's a bit unelegant.
    
## simple_ws_server

A simple websocket server. For the most part, using the above server is a better option. The only advantage is more logging.

This one script assume you're running it at the root of the 'usual' server, i.e. in `./code` (jeroen_check).
