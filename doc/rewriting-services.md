**_WARNING: all legacy services have been rewritten, this document may contain outdated information._**

# Tips for rewriting legacy services

## Background

The services are in the process of being rewritten to use our new service
framework ([#1358](https://github.com/badges/shields/issues/1358)).
Meanwhile, the legacy services extend from an abstract
adapter called [LegacyService][] which provides a place to put the
`camp.route()` invocation. The wrapper extends from [BaseService][], so it
supports badge examples via `category`, `examples`, and `route`. Setting `route`
also enables `createServiceTester()` to infer a service's base path, reducing
boilerplate for [creating the tester][creating a tester].

Legacy services look like:

```js
module.exports = class ExampleService extends LegacyService {
  static get category() {
    return 'build'
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/example\/([^\/]+)\/([^\/]+)\.(svg|png|gif|jpg|json)$/,
      cache(function(data, match, sendBadge, request) {
        var first = match[1]
        var second = match[2]
        var format = match[3]
        var badgeData = getBadgeData('X' + first + 'X', data)
        badgeData.text[1] = second
        badgeData.colorscheme = 'blue'
        badgeData.colorB = '#008bb8'
        sendBadge(format, badgeData)
      })
    )
  }
}
```

References:

- Current documentation
  - [Defining a route][]
  - [Defining examples][]
  - [Creating a tester][]
- [BaseService, the new service framework][baseservice]
- [LegacyService, the adapter][legacyservice]
- [Obsolete tutorial on legacy services][old tutorial], possibly useful as a reference

[old tutorial]: https://github.com/badges/shields/blob/e25e748a03d4cbb50c60b69d2b2404fc08e7cead/doc/TUTORIAL.md
[defining a route]: https://github.com/badges/shields/blob/master/doc/TUTORIAL.md#42-our-first-badge
[defining examples]: https://github.com/badges/shields/blob/master/doc/TUTORIAL.md#44-adding-an-example-to-the-front-page
[creating a tester]: https://github.com/badges/shields/blob/master/doc/service-tests.md#1-boilerplate
[baseservice]: https://github.com/badges/shields/blob/master/services/base.js
[legacyservice]: https://github.com/badges/shields/blob/master/services/legacy-service.js

## First, write some tests

If service tests don’t exist for the legacy service, stop and write them first.
It’s recommended to PR these separately. If there’s some test coverage, it’s
probably fine to move right ahead and add more in the process. Make sure the
tests are passing, though.

## Organization

1. When there’s a single legacy service that handles lots of different things
   (e.g. version, license, and downloads), it should be split into three separate
   service classes and placed in three separate files, e.g.:

- `example-version.service.js`
- `example-license.service.js`
- `example-downloads.service.js`

2. When a badge offers different variants of basically the same thing, it’s okay
   to put them in the same service class. For example, daily/weekly/monthly/total
   downloads can go in one badge, and star rating vs point rating vs rating count
   can go in one badge, and same with various kinds of detail about a pull request.
   The hard limit (as of now anyway) is _one category per service class_.

3. If the tests haven’t been split up, split them up too and make sure they
   still pass.

## Get the route working

1. Disable the legacy service by adding a `return` at the top of
   `registerLegacyRouteHandler()`.

2. Set up the route for one of the badges. First determine if you can express
   the route using a `pattern`. A `pattern` (e.g. `pattern: ':param1/:param2'`) is
   the simplest way to declare the route, also the most readable, and will be
   useful for displaying a badge builder with fields in the front end and
   generating badge URLs programmatically.

3. When creating the initial route, you can stub out the service. A minimal
   service extends BaseJsonService (or BaseService, or one of the others), and
   defines `route()` and `handle()`. `defaultBadgeData` is optional but suggested:

```js
const BaseJsonService = require('../base-json')

class ExampleDownloads extends BaseJsonService {
  static get route() {
    return {
      base: 'example/d',
      pattern: ':param1/:param2',
    }
  }

  static defaultBadgeData() {
    return { label: 'downloads' } // or whatever
  }

  async handle({ param1, param2 }) {
    return { message: 'hello' }
  }
}
```

4. We don’t have really good tools for debugging matches, so the best you can do
   is run a subset of your tests. To run a single service test, add `.only()`
   somewhere in the chain, and run `npm run test:services:trace -- --only=example`.

```js
t.create('build status')
  .get('/pip.json')
  .only() // Prevent this ServiceTester from running its other tests.
  .expectBadge(
    label: 'docs',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  )
```

5. Presumably the test will fail, though by examining the copious output, you
   can confirm the route was matched and the named parameters mapped successfully.
   Since you'll have just run the tests on the old code (right?) you'll know you
   haven't inadvertently changed the route (an easy mistake to make).

6. If the legacy service had a base URL and you've changed it, you’ll need to
   update the tests _and_ the examples. Take care to do that.

## Implement `render()` and `handle()`

Once the route is working, fill out `render()` and `handle()`.

1. If there’s a single service, you can implement fetch as a method or a
   function at the top of the file. If there are more than one service which share
   fetching code, you can put the fetch function in `example-common.js` like this
   one for github:

<details>

```js
const Joi = require('@hapi/joi')
const { errorMessagesFor } = require('./github-helpers')

const issueSchema = Joi.object({
  head: Joi.object({
    sha: Joi.string().required(),
  }).required(),
}).required()

async function fetchIssue(serviceInstance, { user, repo, number }) {
  return serviceInstance._requestJson({
    schema: issueSchema,
    url: `/repos/${user}/${repo}/pulls/${number}`,
    errorMessages: errorMessagesFor('pull request or repo not found'),
  })
}

module.exports = {
  fetchIssue,
}
```

</details>

or create an abstract superclass like **PypiBase**:

<details>

```js
const Joi = require('@hapi/joi')
const BaseJsonService = require('../base-json')

const schema = Joi.object({
  info: Joi.object({
    ...
  }).required()
}).required()

module.exports = class PypiBase extends BaseJsonService {
  static buildRoute(base) {
    return {
      base,
      pattern: ':egg*',
    }
  }

  async fetch({ egg }) {
    return this._requestJson({
      schema,
      url: `https://pypi.org/pypi/${egg}/json`,
      errorMessages: { 404: 'package or version not found' },
    })
  }
}
```

</details>

2. Validation should be handled using Joi. Save this for last. While you're
   getting things working, you can use `const schema = Joi.any()`, which matches
   anything.

3. Substitution of default values should also be handled by Joi, using
   `.default()`.

4. To keep with the design pattern of `render()`, formatting concerns, including
   concatenation and color computation, should be dealt with inside `render()`.
   This helps avoid static examples falling out of sync with the implementation.

## Error handling

BaseService includes built-in runtime error handling. Error classes are defined
in `services/errors.js`. Request code and validation code will throw a runtime
error, which will then bubble up to BaseService, which then renders an error
badge. The cases covered by built-in error handling need not be tested in each
service, and existing tests should be removed.

1. If an external server can't be reached or returns a 5xx status code,
   `_requestJson()` along with code in `lib/error-helper.js` will bubble up an
   **Inaccessible** error.

2. If a response does not match the schema, `validate()` will bubble up an
   **InvalidResponse** error which will display **invalid response data**.

Error handling can also be customized by the service. Alternate messages
corresponding to HTTP status codes can be specified in the `errorMessages`
parameter to `_requestJson()` etc.

For the not found case, a service test should establish that the API is doing
what we expect. If the API returns a 404 error, code in `lib/error-helper.js`
will automatically throw a **NotFound** error. The error message can, and
generally should be customized to display something more specific like
**package not found** or **room not found**.

Not all services return a 404 response in the not found case. Sometimes a
different status code is returned.

Sometimes a 200 response must be examined to distinguish the not found case from a success case. This can be handled in either of two ways:

- Write a schema which accommodates both the success and error cases.
- Write the schema for the success case. Pass `schema: Joi.any()` to
  `_requestJson()`. Manually check for the error case, then invoke
  `_validate()` with the success-case schema.

In either case, the service should throw e.g
`new NotFound({ prettyMessage: 'package not found' })`.

## Convert the examples

1. Convert all the examples to `pattern`, `namedParams`, and `staticExample`. In some cases you can use the `pattern` inherited from `route`, though in other cases you may need to specify a pattern in the example. For example, when showing download badges for several periods, you may want to render the example with an explicit `dt` instead of `:which`. You will also need to specify a pattern for badges that use a `format` regex in the route.

2. Open the frontend and check that the static preview badges look good.
   Remember, none of them are live.

3. Open up the prepared example URLs in their own tabs, and make sure they work correctly.

## Validation

When it's time to add the schema, refer to the Joi API docs:
https://github.com/hapijs/joi/blob/master/API.md

## Housekeeping

Switch to `createServiceTester`:

```js
const t = (module.exports = require('../tester').createServiceTester())
```

This may require updating the URLs, which will be relative to the service's base
URL. When using `createServiceTester`, services need to be specified using
the non-case-sensitive service class name, or a leading substring (e.g.
`AppveyorTests` or `appveyor`).

Do this last. Since it involves changing test URLs, and you don't want to
accidentally change them.
