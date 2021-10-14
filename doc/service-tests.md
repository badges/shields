# Service tests

When creating a badge for a new service or changing a badge's behavior,
automated tests should be included. They serve three purposes:

1. The contributor and reviewer can easily verify the code works as
   intended.

2. When a badge stops working due to an upstream API, maintainers can find out
   right away.

3. They speed up future contributors when they are debugging or improving a
   badge.

Test should cover:

1. Valid behavior
2. Optional parameters like tags or branches
3. Any customized error handling
4. If a non-trivial validator is defined, include tests for malformed responses

## Tutorial

Before getting started, set up a development environment by following the
[setup instructions](https://github.com/badges/shields/blob/master/doc/TUTORIAL.md#2-setup)

We will write some tests for the [Wercker Build service](https://github.com/badges/shields/blob/master/services/wercker/wercker.service.js)

### (1) Boilerplate

The code for our badge is in `services/wercker/wercker.service.js`. Tests for this badge should be stored in `services/wercker/wercker.tester.js`.

We'll start by adding some boilerplate to our file:

```js
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()
```

If our `.service.js` module exports a single class, we can
`createServiceTester`, which uses convention to create a
`ServiceTester` object. Calling this inside
`services/wercker/wercker.tester.js` will create a `ServiceTester` object
configured for the service exported in `services/wercker/wercker.service.js`.
We will add our tests to this `ServiceTester` object `t`, which is exported
from the module.

### (2) Our First Test Case

First we'll add a test for the typical case:

```js
import { isBuildStatus } from '../test-validators.js'

t.create('Build status')
  .get('/build/wercker/go-wercker-api.json')
  .expectBadge({ label: 'build', message: isBuildStatus })
```

1. The `create()` method adds a new test to the tester object.
   The chained-on calls come from the API testing framework [IcedFrisby][].
   Here's a [longer example][] and the complete [API guide][icedfrisby api].
2. We use the `get()` method to request a badge. There are several points to consider here:
   - We need a real project to test against. In this case we have used [wercker/go-wercker-api](https://app.wercker.com/wercker/go-wercker-api/runs) but we could have chosen any stable project.
   - Note that when we call our badge, we are allowing it to communicate with an external service without mocking the response. We write tests which interact with external services, which is unusual practice in unit testing. We do this because one of the purposes of service tests is to notify us if a badge has broken due to an upstream API change. For this reason it is important for at least one test to call the live API without mocking the interaction.
   - All badges on shields can be requested in a number of formats. As well as calling https://img.shields.io/wercker/build/wercker/go-wercker-api.svg to generate ![](https://img.shields.io/wercker/build/wercker/go-wercker-api.svg) we can also call https://img.shields.io/wercker/build/wercker/go-wercker-api.json to request the same content as JSON. When writing service tests, we request the badge in JSON format so it is easier to make assertions about the content.
   - We don't need to explicitly call `/wercker/build/wercker/go-wercker-api.json` here, only `/build/wercker/go-wercker-api.json`. When we create a tester object with `createServiceTester()` the URL base defined in our service class (in this case `/wercker`) is used as the base URL for any requests made by the tester object.
3. `expectBadge()` is a helper function which accepts either a string literal, a [RegExp][] or a [Joi][] schema for the different fields.
   Joi is a validation library that is build into IcedFrisby which you can use to
   match based on a set of allowed strings, regexes, or specific values. You can
   refer to their [API reference][joi api].
4. We expect `label` to be a string literal `"build"`.
5. Because this test depends on a live service, we don't want our test to depend on our API call returning a particular build status. Instead we should perform a "picture check" to assert that the badge data conforms to an expected pattern. Our test should not depend on the status of the example project's build, but should fail if trying to generate the badge throws an error, or if there is a breaking change to the upstream API. In this case we will use a pre-defined regular expression to check that the badge value looks like a build status. [services/test-validators.js](https://github.com/badges/shields/blob/master/services/test-validators.js) defines a number of useful validators we can use. Many of the common badge types (version, downloads, rank, etc.) already have validators defined here.

When defining an IcedFrisby test, typically you would invoke the `toss()`
method, to register the test. This is not necessary, because the Shields test
harness will call it for you.

[icedfrisby]: https://github.com/MarkHerhold/IcedFrisby
[longer example]: https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
[icedfrisby api]: https://github.com/MarkHerhold/IcedFrisby/blob/master/API.md
[joi]: https://github.com/hapijs/joi
[joi api]: https://github.com/hapijs/joi/blob/master/API.md
[regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

### (3) Running the Tests

Lets run the test we have written:

```
npm run test:services -- --only=wercker
```

The `--only=` option indicates which service or services you want to test. You
can provide a comma-separated list here.

The `--` tells the NPM CLI to pass the remaining arguments through to the test
runner.

Here's the output:

```
Server is starting up: http://lib/service-test-runner/cli.js:80/
  Wercker
    Build status
      ✓
        [ GET /build/wercker/go-wercker-api.json ] (572ms)

  1 passing (1s)
```

That's looking good!

Sometimes if we have a failing test, it is useful to be able to see some logging output to help work out why the test is failing. We can do that by calling `npm run test:services:trace`. Try running

```
npm run test:services:trace -- --only=wercker
```

to run the test with some additional debug output.

### (4) Writing More Tests

We should write tests cases for valid paths through our code. The Wercker badge supports an optional branch parameter so we'll add a second test for a branch build.

```js
t.create('Build status (with branch)')
  .get('/build/wercker/go-wercker-api/master.json')
  .expectBadge({ label: 'build', message: isBuildStatus })
```

```
Server is starting up: http://lib/service-test-runner/cli.js:80/
  Wercker
    Build status
      ✓
        [ GET /build/wercker/go-wercker-api.json ] (572ms)
    Build status (with branch)
      ✓
        [ GET /build/wercker/go-wercker-api/master.json ] (368ms)

  2 passing (1s)
```

Once we have multiple tests, sometimes it is useful to run only one test. We can do this using the `--fgrep` argument. For example:

```
npm run test:services -- --only="wercker" --fgrep="Build status (with branch)"
```

Having covered the typical and custom cases, we'll move on to errors. We should include a test for the 'not found' response and also tests for any other custom error handling. The Wercker integration defines a custom error condition for 401 as well as a custom 404 message:

```js
errorMessages: {
  401: 'private application not supported',
  404: 'application not found',
}
```

First we'll add a test for a project which will return a 404 error:

```js
t.create('Build status (application not found)')
  .get('/build/some-project/that-doesnt-exist.json')
  .expectBadge({ label: 'build', message: 'application not found' })
```

In this case we are expecting a string literal instead of a pattern for `message`. This narrows down the expectation and gives us a more helpful error message if the test fails.

We also want to include a test for the 'private application not supported' case. One way to do this would be to find another example of a private project which is unlikely to change. For example:

```js
t.create('Build status (private application)')
  .get('/build/wercker/blueprint.json')
  .expectBadge({ label: 'build', message: 'private application not supported' })
```

## (5) Mocking Responses

If we didn't have a stable example of a private project, another approach would be to mock the response. An alternative test for the 'private application' case might look like:

```js
t.create('Build status (private application)')
  .get('/build/wercker/go-wercker-api.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(401)
  )
  .expectBadge({ label: 'build', message: 'private application not supported' })
```

This will intercept the request and provide our own mock response.
We use the `intercept()` method provided by the
[icedfrisby-nock plugin][icedfrisby-nock]. It takes a setup function,
which returns an interceptor, and exposes the full API of the HTTP mocking
library [Nock][].

Nock is fussy. All parts of a request must match perfectly for the mock to
take effect, including the HTTP method (in this case GET), scheme (https), host,
and path.

[icedfrisby-nock]: https://github.com/paulmelnikow/icedfrisby-nock#usage
[nock]: https://github.com/node-nock/nock

Our test suite should also include service tests which receive a known value from the API. For example, in the `render()` method of our service, there is some logic which sets the badge color based on the build status:

```js
static render({ status, result }) {
  if (status === 'finished') {
    if (result === 'passed') {
      return { message: 'passing', color: 'brightgreen' }
    } else {
      return { message: result, color: 'red' }
    }
  }
  return { message: status }
}
```

We can also use nock to intercept API calls to return a known response body.

```js
t.create('Build passed')
  .get('/build/wercker/go-wercker-api.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'passed' }])
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('Build failed')
  .get('/build/wercker/go-wercker-api.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'failed' }])
  )
  .expectBadge({ label: 'build', message: 'failed', color: 'red' })
```

Note that in these tests, we have specified a `color` parameter in `expectBadge`. This is helpful in a case like this when we want to test custom color logic, but it is only necessary to explicitly test color values if our badge implements custom logic for setting the badge colors.

## Code coverage

By checking code coverage, we can make sure we've covered all our bases.

We can generate a coverage report and open it:

```
npm run coverage:test:services -- -- --only=wercker
npm run coverage:report:open
```

## Pull requests

Pull requests must follow the [documented conventions][pr-conventions] in order to execute the correct set of service tests.

[pr-conventions]: https://github.com/badges/shields/blob/master/CONTRIBUTING.md#running-service-tests-in-pull-requests

## Getting help

If you have questions about how to write your tests, please open an issue. If
there's already an issue open for the badge you're working on, you can post a
comment there instead.

## Further reading

- [IcedFrisby API][]
- [Joi API][]
- [icedfrisby-nock][]
- [Nock API](https://github.com/node-nock/nock#use)
