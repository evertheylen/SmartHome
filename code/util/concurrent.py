"""
Helpers for to enable concurrency.
"""

from tornado.platform.asyncio import to_tornado_future
from functools import wraps

def blocking(method):
    """
    Wraps the method in an async method, and executes the function on `self.executor`.
    `self.executor` has to a `ThreadPoolExecutor`.
    """
    
    @wraps(method)
    async def wrapper(self, *args, **kwargs):
        fut = self.executor.submit(method, self, *args, **kwargs)
        return await to_tornado_future(fut)
    return wrapper
