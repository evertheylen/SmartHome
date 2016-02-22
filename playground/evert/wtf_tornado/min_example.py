import tornado
import tornado.websocket
import tornado.ioloop
import tornado.gen
import tornado.web


# Custom ws async decorator
import functools
from tornado import stack_context
from tornado import gen

def async_wrapper_2(method):
    """
    To be used for functions that are expected to be synchronous but
    where you still want to use 'async' and 'await'
    """
    
    @functools.wraps(method)
    @gen.coroutine
    def wrapper(self, *args, **kwargs):
        result = method(self, *args, **kwargs)
        if result is not None:
            result = gen.convert_yielded(result)
            # If @asynchronous is used with @gen.coroutine, (but
            # not @gen.engine), we can automatically finish the
            # request when the future resolves.  Additionally,
            # the Future will swallow any exceptions so we need
            # to throw them back out to the stack context to finish
            # the request.
            def future_complete(f):
                f.result()
                # don't finish
            tornado.ioloop.IOLoop.current().add_future(result, future_complete)
            # Once we have done this, hide the Future from our
            # caller (i.e. RequestHandler._when_complete), which
            # would otherwise set up its own callback and
            # exception handler (resulting in exceptions being
            # logged twice).
            ret = yield result.result()
            return ret
        return result
    return wrapper

def async_wrapper(method):
    @functools.wraps(method)
    @gen.coroutine
    def wrapper(self, *args, **kwargs):
        ret = yield method(self, *args, **kwargs)
        return ret
    return wrapper


class AnyOrigin(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

class NewWsHandler(AnyOrigin):
    def finish(self):
        pass
    
    @tornado.web.asynchronous
    async def on_message(self, message):
        await self.write_message("echo " + message)

class OldWsHandler(AnyOrigin):
    @tornado.gen.coroutine
    def on_message(self, message):
        yield self.write_message("echo " + message)

class LegitWsHandler(AnyOrigin):
    # may not be wrapped in coroutine or anything
    async def async_on_message(self, message):
        self.write_message(str(await do_calcs()))
    
    def on_message(self, message):
        tornado.ioloop.IOLoop.current().spawn_callback(LegitWsHandler.async_on_message, self, message)
        

async def do_calcs():
    await tornado.gen.sleep(0.5)
    return 5.124

async def tick():
    for i in range(20):
        await tornado.gen.sleep(0.01)
        print("tick")

@async_wrapper
async def sleep(ms):
    io.spawn_callback(tick)
    await tornado.gen.sleep(ms/1000)
    print("done")
    print("wtf?")
    return 5
    return await do_calcs()

WsHandler = LegitWsHandler

if __name__ == "__main__":
    #io = tornado.ioloop.IOLoop.current()
    #io.spawn_callback(lambda: print(sleep(100)))
    #io.start()

    app = tornado.web.Application([(r'/', WsHandler)])
    app.listen(8080)
    tornado.ioloop.IOLoop.current().start()
