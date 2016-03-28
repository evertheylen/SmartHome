 
from collections import OrderedDict
 
import tornado
import tornado.template

import pdb

from overwatch import localdir

# Handlers are instantiated for every request!
def create_DebugHandler(controller):
    with open(localdir("html/debug.html"), "r") as f:
        content = str(f.read())
        templ = tornado.template.Template(content)
    
    queries = OrderedDict()
    cur_text = ""
    with open(localdir("../docs/JSON_examples.txt"), "r") as ef:
        for l in ef.readlines():
            if len(l) <= 1:
                continue
            elif l[0] == "#":
                continue
            elif l[0] == "{":
                queries[cur_text] = l[:-1]
                cur_text = ""
            else:
                cur_text += l[:-1]

    
    class DebugHandler(tornado.web.RequestHandler):
        def get(self, *args):
            self.write(templ.generate(q=queries))
            
        def post(self, *args):
            self.write(templ.generate(q=queries))
    
    return DebugHandler
