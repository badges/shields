Vendor tests
============

When creating a badge for a new service or changing a badge's behavior, tests
should be included. They serve three purposes:

1. The contributor and revewer can easily verify the code works as
   intended.

2. When a badge stops working on the live server, maintainers can find out
   right away.

3. They speed up future contributors when they are debugging or improving a
   badge.

Contributors should take care to cover all parts of a badge's functionaliy:

- Typical case
- Customized cases
- Server errors
- Not found errors
- Parse errors

Tests should cover all the code branches within in a badge.


Tutorial
--------

This tutorial will show tests for the Travis badge:

[![](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

```js
camp.route(/^\/travis(-ci)?\/([^\/]+\/[^\/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
cache(function(data, match, sendBadge, request) {
  var userRepo = match[2];  // eg, espadrine/sc
  var branch = match[3];
  var format = match[4];
  var options = {
    method: 'HEAD',
    uri: 'https://api.travis-ci.org/' + userRepo + '.svg',
  };
  if (branch != null) {
    options.uri += '?branch=' + branch;
  }
  var badgeData = getBadgeData('build', data);
  request(options, function(err, res) {
    if (err != null) {
      console.error('Travis error: ' + err.stack);
      if (res) { console.error(''+res); }
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
      return;
    }
    try {
      var state = res.headers['content-disposition']
                     .match(/filename="(.+)\.svg"/)[1];
      badgeData.text[1] = state;
      if (state === 'passing') {
        badgeData.colorscheme = 'brightgreen';
      } else if (state === 'failing') {
        badgeData.colorscheme = 'red';
      } else {
        badgeData.text[1] = state;
      }
      sendBadge(format, badgeData);

    } catch(e) {
      badgeData.text[1] = 'invalid';
      sendBadge(format, badgeData);
    }
  });
}));
```

If you haven't already, install the project dependencies:

```
npm i
```

We'll start by creating a new module, `vendor/travis.js`, using this
boilerplate:

```js
'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester('Travis', '/travis');
module.exports = t;
```

We'll add all our tests to this ServiceTester object, which gets exported from
the module. The two arguments to the constructor are the name of the service
and its URI prefix. The tester will prepend it to the URIs you provide later,
which saves copying and pasting.

Next we'll add a test for the typical case.

[/travis/rust-lang/rust.svg](https://img.shields.io/travis/rust-lang/rust.svg)

[![](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

The JSON format for this badge is `{ name: 'build', value: 'passing' }`.

Here's the test:

```js
t.create('build status on default branch')
  .get('/rust-lang/rust.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'unknown')
  }));
```

The `create()` method is used to give the tester a new test. The other methods
come from [IcedFrisby][], on which the tester is based. Here's a
[longer example][] and the complete [API guide][].

Notice we don't have to specify `/travis` again, or even `localhost`. The test
runner handles that for us.

`expectJSONTypes()` is an IcedFrisby method which accepts a [Joi][] schema. Joi
is a validation library that is build into IcedFrisby which you can use to match
based on a set of allowed strings, regexes, or specific values.

Typically when defining an IcedFrisby test, you would invoke the `toss()`
method at the end, to register the test. However, this is not necessary here.
The test runner handles that as well.

[IcedFrisby]: https://github.com/MarkHerhold/IcedFrisby
[longer example]: https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
[API guide]: https://github.com/MarkHerhold/IcedFrisby/blob/master/API.md

Run the new test:

```
npm run test:vendor -- --only=travis
```

The `--` tells the NPM CLI to pass the remaining arguments through to the
program being invoked. The `--only=` option tells the test runner which
services you want to test. You can provide a comma-separated list of services.

Here's the output:

```
http://localhost:1111/try.html
  Travis
    build status on default branch
      ✓
  [ GET http://localhost:1111/travis/rust-lang/rust.json ] (265ms)


  1 passing (1s)
```

Looking good!

Next we'll add a second test, for a branch build.

```js
t.create('build status on named branch')
  .get('/rust-lang/rust/stable.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'unknown')
  }));
```

```
http://localhost:1111/try.html
  Travis
    build status on default branch
      ✓
  [ GET http://localhost:1111/travis/rust-lang/rust.json ] (220ms)
    build status on named branch
      ✓
  [ GET http://localhost:1111/travis/rust-lang/rust/stable.json ] (100ms)


  2 passing (1s)
```

Having covered the typical and customize cases, we'll move on to errors.

First, a nonexistent repo, which Travis reports as having an `unknown` status:

```js
t.create('unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'unknown' });
```

Since we know exactly what values should be returned, we can use IcedFrisby's
terser `expectJSON()` method.

Next, we want to enter the `catch` block. To do this, we need to trigger an
exception in the `try` block. After studying the code, we realize this would
happen on a request without a Content-Disposition header.

Since we don't have an easy way to get the server to return a real request
like this, we will intercept the request and return a mock response. To do
this, we use the `intercept()` method provided by the [icedfrisby-nock
plugin][]. This method takes a setup function, which exposes the full range
of the HTTP mocking library [Nock][].

```js
t.create('missing content-disposition header')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .reply(200))
  .expectJSON({ name: 'build', value: 'invalid' });
```

Note that all parts of a request must match for the mock to take effect,
including the method (in this case HEAD), scheme (https), host, and path. Nock
has no sense of humor.

[icedfrisby-nock]: https://github.com/paulmelnikow/icedfrisby-nock#usage
[Nock]: https://github.com/node-nock/nock


Code coverage
-------------

Code coverage testing is helpful for making sure you've covered all your
bases.

Generate a coverage report and open it:

```
npm run coverage:test:vendor -- -- --only=travis
npm run coverage:report:open
```

Note, the two sets of double dashes.

After searching for the Travis code, we see that we've miss a big block, which
is the error branch in the request callback. To test that, we mock a
connection error.

```js
t.create('connection error')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .replyWithError({ code: 'ECONNRESET' }))
  .expectJSON({ name: 'build', value: 'invalid' });
```


Getting help
------------

If you have questions about how to write your tests, please open an issue. If
there's already an issue open for the badge you're working on, you can post a
comment there instead.
