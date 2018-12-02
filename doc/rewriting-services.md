# Tips for rewriting legacy services

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
The hard limit (as of now anyway) is *one category per service class*.

3. If the tests haven’t been split up, split them up too and make sure they
still pass.

## Get the route working

1. Disable the legacy service by adding a `return` at the top of
`registerLegacyRouteHandler()`.

2. Set up the route for one of the badges. First determine if you can express
the route using a `pattern`. A `pattern` (e.g. `pattern: ':param1/:param2'`) is
the simplest way to declare the route, also the most readable, and will be
useful for displaying a badge builder with fields in the front end and
generating badge URLs programmatically. One limitation to keep in mind is that,
at present, the trailing parameter of a pattern can't be optional. If the last
part of a route is optional, like a branch, you will need to use a `format`
regex string (e.g. `format: '([^/]+/[^/]+)'`).

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
somewhere in the chain, and run `npm run test:services:trace — —only=example`.

```js
t.create('build status')
  .get('/pip.json')
  .only() // Prevent this ServiceTester from running its other tests.
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docs',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )
```

5. Presumably the test will fail, though by examining the copious output, you
can confirm the route was matched and the named parameters mapped successfully.
Since you'll have just run the tests on the old code (right?) you'll know you
haven't inadvertently changed the route (an easy mistake to make).

6. If the legacy service had a base URL and you've changed it, you’ll need to
update the tests _and_ the examples. Take care to do that.

## Implement `render()` and `handle()`

1. Once the route is working, fill out `render()` and `handle()`. If there’s a
single service, you can implement fetch as a method or a function at the top of
the file. If there are more than one service which share fetching code, you can
put the fetch function in `example-common.js` like this one for github:

<details>

```js
const Joi = require('joi')
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
const Joi = require('joi')
const BaseJsonService = require('../base-json')

const schema = Joi.object({
  info: Joi.object({
    version: Joi.string().required(),
    // https://github.com/badges/shields/issues/2022
    license: Joi.string().allow(''),
    classifiers: Joi.array()
      .items(Joi.string())
      .required(),
  }).required(),
  releases: Joi.object()
    .pattern(
      Joi.string(),
      Joi.array()
        .items(
          Joi.object({
            packagetype: Joi.string().required(),
          })
        )
        .required()

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

2. To keep with the design pattern of `render()`, formatting concerns, including
concatenation and color computation, should be dealt with inside `render()`.
This helps avoid static examples falling out of sync with the implementation.

## Convert the examples

1. Convert all the examples to `pattern`, `namedParams`, and `staticExample`. In some cases you can use the `pattern` inherited from `route`, though in other cases you may need to specify a pattern in the example. For example, when showing download badges for several periods, you may want to render the example with an explicit `dt` instead of `:which`. You will also need to specify a pattern for badges that use a `format` regex in the route.

2. Open the frontend and check that the static preview badges look good.
Remember, none of them are live.

3. Open up the prepared example URLs in their own tabs, and make sure they work correctly.

## Validation

Add the schemas toward the end.

Joi API docs: https://github.com/hapijs/joi/blob/master/API.md

## Housekeeping

Switch to `createServiceTester`:

```js
const t = require('../create-service-tester')()
```

This may require updating the URLs, which will be relative to the service's base
URL. When using `createServiceTester`, services need to be specified using
the non-case-sensitive service class name, or a trailing substring (e.g.
`AppveyorTests` or `appveyor`).

Do this last. Since it involves changing test URLs, and you don't want to
accidentally change them.
