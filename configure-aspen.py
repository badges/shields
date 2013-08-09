import os
import time

from aspen import log


website.renderer_default = "tornado"


def time_request_inbound(request):
    request._start = time.time()

def time_request_outbound(response):
    start = response.request._start
    end = time.time()
    elapsed = (end - start) * 1000.0
    log("Request served in %.3f ms." % elapsed)

website.hooks.inbound_early += [time_request_inbound]
website.hooks.outbound += [time_request_outbound]



# Up the threadpool size.
# =======================
# Yanked from Gittip. Should upstream this.

def up_minthreads(website):
    website.network_engine.cheroot_server.requests.min = \
                                           int(os.environ['ASPEN_THREAD_POOL'])

website.hooks.startup.insert(0, up_minthreads)
