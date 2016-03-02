 
from collections import OrderedDict
 
import tornado
import tornado.template

# Handlers are instantiated for every request!
def create_DebugHandler(controller):
    f = open("html/debug.html", "r")
    content = str(f.read())
    templ = tornado.template.Template(content)
    
    queries = OrderedDict()
    cur_text = ""
    ef = open("../docs/JSON_examples.txt", "r")
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
