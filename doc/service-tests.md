# Service tests

When creating a badge for a new service or changing a badge's behavior,
automated tests should be included. They serve three purposes:

1. The contributor and reviewer can easily verify the code works as
   intended.

2. When a badge stops working due to an upstream API, maintainers can find out
   right away.

3. They speed up future contributors when they are debugging or improving a
   badge.

Tests should cover:

1. Valid behavior
2. Optional parameters like tags or branches
3. Any customized error handling
4. If a non-trivial validator is defined, include tests for malformed responses

## Tutorial

Before getting started, set up a development environment by following the
[setup instructions](https://github.com/badges/shields/blob/master/doc/TUTORIAL.md#2-setup)

We will write some tests for [Docs.rs](https://github.com/badges/shields/blob/master/services/docsrs/docsrs.service.js), a service that builds documentation of crates, which are packages in the Rust programming language.

### (1) Boilerplate

The code for our badge is in `services/docsrs/docsrs.service.js`. Tests for this badge should be stored in `services/docsrs/docsrs.tester.js`.

We'll start by adding some boilerplate to our file:

```js
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()
```

If our `.service.js` module exports a single class, we can
`createServiceTester`, which uses convention to create a
`ServiceTester` object. Calling this inside
`services/docsrs/docsrs.tester.js` will create a `ServiceTester` object
configured for the service exported in `services/docsrs/docsrs.service.js`.
We will add our tests to this `ServiceTester` object `t`, which is exported
from the module.

### (2) Our First Test Case

First we'll add a test for the typical case:

```js
import Joi from 'joi'

t.create('Docs with no version specified')
  .get('/tokio.json')
  .expectBadge({
    label: 'docs',
    message: Joi.allow('passing', 'failing'),
  })
```

1. The `create()` method adds a new test to the tester object.
   The chained-on calls come from the API testing framework [IcedFrisby][].
   Here's a [longer example][] and the complete [API guide][icedfrisby api].
2. We use the `get()` method to request a badge. There are several points to consider here:
   - We need a real crate to test against. In this case we have used [Tokio](https://docs.rs/tokio) but we could have chosen any one.
   - Note that when we call our badge, we are allowing it to communicate with an external service without mocking the response. We write tests which interact with external services, which is unusual practice in unit testing. We do this because one of the purposes of service tests is to notify us if a badge has broken due to an upstream API change. For this reason it is important for at least one test to call the live API without mocking the interaction.
   - All badges on shields can be requested in a number of formats. As well as calling https://img.shields.io/docsrs/tokio.svg to generate ![](https://img.shields.io/docsrs/tokio.svg) we can also call https://img.shields.io/docsrs/tokio.json to request the same content as JSON. When writing service tests, we request the badge in JSON format so it is easier to make assertions about the content.
   - We don't need to explicitly call `/docsrs/tokio.json` here, only `/tokio.json`. When we create a tester object with `createServiceTester()` the URL base defined in our service class (in this case `/docsrs`) is used as the base URL for any requests made by the tester object.
3. `expectBadge()` is a helper function which accepts either a string literal, a [RegExp][] or a [Joi][] schema for the different fields.
   Joi is a validation library that is built into IcedFrisby which you can use to
   match based on a set of allowed strings, regexes, or specific values. You can
   refer to their [API reference][joi api].
4. We expect `label` to be a string literal `"docs"`.
5. Because this test depends on a live service, we don't want our test to depend on our API call returning a particular build status. Instead we should perform a "picture check" to assert that the badge data conforms to an expected pattern. Our test should not depend on the status of the example crates's documentation build, but should fail if trying to generate the badge throws an error, or if there is a breaking change to the upstream API. In this case, we specify a list with all possible response values, `Joi.allow('passing', 'failing')`. For more complex cases, [services/test-validators.js](https://github.com/badges/shields/blob/master/services/test-validators.js) defines a number of useful validators we can use with regular expressions. Many of the common badge types (version, downloads, rank, etc.) already have validators defined there.

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
npm run test:services -- --only=docsrs
```

The `--only=` option indicates which service or services you want to test. You
can provide a comma-separated list here.

The `--` tells the NPM CLI to pass the remaining arguments through to the test
runner.

Here's the output:

```
Server is starting up: http://localhost:1111/
  DocsRs
    [live] Docs with no version specified
      √
        [ GET /tokio.json ] (441ms)


  1 passing (1s)
```

That's looking good!

Sometimes if we have a failing test, it is useful to be able to see some logging output to help work out why the test is failing. We can do that by calling `npm run test:services:trace`. Try running

```
npm run test:services:trace -- --only=docsrs
```

to run the test with some additional debug output.

### (4) Writing More Tests

We should write tests cases for valid paths through our code. The Docs.rs badge supports an optional version parameter so we'll add a second test for a branch build. In this case, we know for sure that the documentation for this older version was successfully built, we specify a string literal instead of a Joi schema for `message`. This narrows down the expectation and gives us a more helpful error message if the test fails.

```js
t.create('Passing docs for version').get('/tokio/1.37.0.json').expectBadge({
  label: 'docs@1.37.0',
  message: 'passing',
  color: 'brightgreen',
})
```

```
Server is starting up: http://localhost:1111/
  DocsRs
    [live] Docs with no version specified
      √
        [ GET /tokio.json ] (408ms)
    [live] Passing docs for version
      √
        [ GET /tokio/1.37.0.json ] (171ms)


  2 passing (2s)
```

Once we have multiple tests, sometimes it is useful to run only one test. We can do this using the `--fgrep` argument. For example:

```
npm run test:services -- --only="docsrs" --fgrep="Passing docs for version"
```

Documentation for tokio version 1.32.1 failed to build, we can also add a corresponding test:

```js
t.create('Failing docs for version').get('/tokio/1.32.1.json').expectBadge({
  label: 'docs@1.32.1',
  message: 'failing',
  color: 'red',
})
```

Note that in these tests, we have specified a `color` parameter in `expectBadge`. This is helpful in a case like this when we want to test custom color logic, but it is only necessary to explicitly test color values if our badge implements custom logic for setting the badge colors.

Having covered the typical and custom cases, we'll move on to errors. We should include a test for the 'not found' response and also tests for any other custom error handling. When a version is specified, the Docs.rs integration defines a custom error condition for 400 status codes:

```js
httpErrors: version ? { 400: 'malformed version' } : {},
```

First we'll add a test for a crate and a test for a version which will return 404 errors:

```js
t.create('Crate not found')
  .get('/not-a-crate/latest.json')
  .expectBadge({ label: 'docs', message: 'not found' })

t.create('Version not found')
  .get('/tokio/0.8.json')
  .expectBadge({ label: 'docs', message: 'not found' })
```

We also want to include a test for a case where a malformed version was specified. For example:

```js
t.create('Malformed version')
  .get('/tokio/not-a-version.json')
  .expectBadge({ label: 'docs', message: 'malformed version' })
```

## (5) Mocking Responses

If we didn't have a stable example of crate version with a failing documentation build, another approach would be to mock the response. An alternative test for the 'Failing docs for version' case might look like:

```js
t.create('Failing docs for version')
  .get('/tokio/1.32.1.json')
  .intercept(nock =>
    nock('https://docs.rs/crate')
      .get('/tokio/1.32.1/status.json')
      .reply(200, { doc_status: false }),
  )
  .expectBadge({
    label: 'docs@1.32.1',
    message: 'failing',
    color: 'red',
  })
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

## Code coverage

By checking code coverage, we can make sure we've covered all our bases.

We can generate a coverage report and open it:

```
npm run coverage:test:services -- -- --only=docsrs
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
