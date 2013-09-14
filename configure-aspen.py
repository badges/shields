from __future__ import unicode_literals

import os
import time

import aspen_sentry
from aspen import log


aspen_sentry.install(website)


website.renderer_default = b"tornado"


def time_request_inbound(request):
    request._start = time.time()

def time_request_outbound(response):
    start = response.request._start
    end = time.time()
    elapsed = (end - start) * 1000.0
    log("Request served in %.3f ms." % elapsed)

website.hooks.inbound_early += [time_request_inbound]
website.hooks.outbound += [time_request_outbound]


# Collapse /foo/bar/baz.png into /foo/bar%2Fbaz.png.
# ==================================================
# https://github.com/gittip/shields.io/issues/57

def redirect_uncollapsed_paths(request):
    if b'%2F' in request.line.uri.path.raw:
        request.redirect(request.line.uri.path.raw.replace(b'%2F', b'/'))

website.hooks.inbound_early += [redirect_uncollapsed_paths]


# Up the threadpool size.
# =======================
# Yanked from Gittip. Should upstream this.

def up_minthreads(website):
    website.network_engine.cheroot_server.requests.min = \
                                           int(os.environ['ASPEN_THREAD_POOL'])

website.hooks.startup.insert(0, up_minthreads)
