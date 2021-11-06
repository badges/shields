# High-level code walkthrough

## Code inventory and testing strategy

The Shields codebase is divided into several parts:

1.  The frontend (about 7% of the code)
    1. [`frontend`][frontend]
2.  The badge renderer (which is available as an npm package)
    1.  [`badge-maker`][badge-maker]
3.  The base service classes (about 8% of the code, and probably the most important
    code in the codebase)
    1.  [`core/base-service`][base-service]
4.  The server code and a few related odds and ends
    1.  [`core/server`][server]
5.  Helper code for token pooling and persistence (used to avoid GitHub rate limiting)
    1.  [`core/token-pooling`][token-pooling]
6.  Service common helper functions (about 7% of the code, and fairly important
    since it’s shared across much of the service code)
    1.  `*.js` in the root of [`services`][services]
7.  The services themselves (about 80% of the code)
    1.  `*.js` in the folders of [`services`][services]
8.  The badge suggestion endpoint (Note: it's tested as if it’s a service.)
    1.  [`lib/suggest.js`][suggest]

[frontend]: https://github.com/badges/shields/tree/master/frontend
[badge-maker]: https://github.com/badges/shields/tree/master/badge-maker
[base-service]: https://github.com/badges/shields/tree/master/core/base-service
[server]: https://github.com/badges/shields/tree/master/core/server
[token-pooling]: https://github.com/badges/shields/tree/master/core/token-pooling
[services]: https://github.com/badges/shields/tree/master/services
[suggest]: https://github.com/badges/shields/tree/master/lib/suggest.js

The tests are also divided into several parts:

1.  Unit and functional tests of the frontend
    1.  `frontend/**/*.spec.js`
2.  Unit and functional tests of the badge renderer
    1.  `badge-maker/**/*.spec.js`
3.  Unit and functional tests of the core code
    1.  `core/**/*.spec.js`
4.  Unit and functional tests of the service helper functions
    1.  `services/*.spec.js`
5.  Unit and functional tests of the service code (we have only a few of these)
    1.  `services/*/**/*.spec.js`
6.  The service tester and service test runner
    1.  [`core/service-test-runner`][service-test-runner]
7.  [The service tests themselves][service tests] live integration tests of the
    services, and some mocked tests
    1.  `*.tester.js` in subfolders of [`services`][services]
8.  Integration tests of Redis-backed persistence code
    1.  [`core/token-pooling/redis-token-persistence.integration.js`][redis-token-persistence.integration]
9.  Integration tests of the GitHub authorization code
    1.  [`services/github/github-api-provider.integration.js`][github-api-provider.integration]

[service-test-runner]: https://github.com/badges/shields/tree/master/core/service-test-runner
[service tests]: https://github.com/badges/shields/blob/master/doc/service-tests.md
[redis-token-persistence.integration]: https://github.com/badges/shields/blob/master/core/token-pooling/redis-token-persistence.integration.js
[github-api-provider.integration]: https://github.com/badges/shields/blob/master/services/github/github-api-provider.integration.js

Our goal is for the core code is to reach 100% coverage of the code in the
frontend, core, and service helper functions when the unit and functional
tests are run.

Our test strategy for the service code is a bit different. It’s primarily
based on live integration tests. That’s because service response formats can
change, and when they do the badges break. We want our tests to fail when this
happens. That way we can fix the problems proactively instead of waiting for
users to report them. There’s a good discussion about this decision in
[#927][issue 927]. It’s acceptable to write mocked tests of logic that is
difficult to reach using live tests, however where possible, it’s preferred to
test this kind of logic through unit tests (e.g. of `render()` and
`transform()` functions).

[issue 927]: https://github.com/badges/shields/issues/927

## Server initialization

1.  The server entrypoint is [`server.js`][entrypoint] which sets up error
    reporting, loads config, and creates an instance of the server.

2.  The Server, which is defined in
    [`core/server/server.js`][core/server/server], is based on the web
    framework [Scoutcamp][]. It creates an http server, sets up helpers for
    token persistence and monitoring. Then it loads all the services,
    injecting dependencies as it asks each one to register its route
    with Scoutcamp.

3.  The service registration continues in `BaseService.register`. From its
    `route` property, it derives a regular expression to match the route
    path, and invokes `camp.route` with this value.

4.  At this point the situation gets gnarly and hard to follow. For the
    purpose of initialization, suffice it to say that `camp.route` invokes a
    callback with the four parameters `( queryParams, match, end, ask )` which
    is created in a legacy helper function in
    [`legacy-request-handler.js`][legacy-request-handler]. This callback
    delegates to a callback in `BaseService.register` with four different
    parameters `( queryParams, match, sendBadge )`, which
    then runs `BaseService.invoke`. `BaseService.invoke` instantiates the
    service and runs `BaseService#handle`.

[entrypoint]: https://github.com/badges/shields/blob/master/server.js
[core/server/server]: https://github.com/badges/shields/blob/master/core/server/server.js
[scoutcamp]: https://github.com/espadrine/sc
[legacy-request-handler]: https://github.com/badges/shields/blob/master/core/base-service/legacy-request-handler.js

## Downstream caching

1.  In production, the majority of requests are served from caches, including
    the browser cache, GitHub’s camo proxy server, and other downstream caches.
2.  The Shields servers sit behind the Cloudflare CDN. The CDN itself handles
    about 40% of the HTTPS requests that come in.
3.  The remaining requests are proxied to one of the servers.
4.  See the [production hosting documentation][production hosting] for a
    fuller discussion of the production architecture.

[production hosting]: https://github.com/badges/shields/blob/master/doc/production-hosting.md

## How the server makes a badge

1.  An HTTPS request arrives. Scoutcamp inspects the URL path and matches it
    against the regexes for all the registered routes until it finds one that
    matches. (See *Initialization* above for an explanation of how routes are
    registered.)
2.  Scoutcamp invokes a callback with the four parameters:
    `( queryParams, match, end, ask )`. This callback is defined in
    [`legacy-request-handler`][legacy-request-handler]. A timeout is set to
    handle unresponsive service code and the next callback is invoked: the
    legacy handler function.
3.  The legacy handler function receives
    `( queryParams, match, sendBadge )`. Its job is to extract data
    from the regex `match` and `queryParams`, and then invoke `sendBadge`
    with the result.
4.  The implementation of this function is in `BaseService.register`. It
    works by running `BaseService.invoke`, which instantiates the service,
    injects more dependencies, and invokes `BaseService.handle` which is
    implemented by the service subclass.
5.  The job of `handle()`, which should be implemented by each service
    subclass, is to return an object which partially describes a badge or
    throw one of the handled error classes. "Partially rendered" most
    commonly means a non-empty message and an optional color. In the case
    of the Endpoint badge, it could include many other parameters. At the
    time of writing the handled error classes were NotFound,
    InvalidResponse, Inaccessible, InvalidParameter, and Deprecated.
    Throwing any other error is a programmer error which will be
    [reported][error reporting] and described to the user as a **shields
    internal error**.
6.  A typical `handle()` function delegates to one or more helpers to
    handle stages of the request:
    1.  **fetch**: load the needed data from the upstream service and
        validate it
    2.  **transform**: pluck, convert, or summarize the response format
        into a few properties which will be displayed on the badge
    3.  **render**: given a few properties, return a message, optional
        color, and optional label.
7.  When an error is thrown, BaseService steps in and converts the error
    object to renderable properties: `{ isError, message, color }`.
8.  The service invokes [`coalesceBadge`][coalescebadge] whose job is to
    coalesce query string overrides with values from the service and the
    service’s defaults to produce an object that fully describes the badge to
    be rendered.
9.  `sendBadge` is invoked with that object. It does some housekeeping on the
    timeout. Then it renders the badge to svg or raster and pushes out the
    result over the HTTPS connection.

[error reporting]: https://github.com/badges/shields/blob/master/doc/production-hosting.md#error-reporting
[coalescebadge]: https://github.com/badges/shields/blob/master/core/base-service/coalesce-badge.js
