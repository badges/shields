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

Contributors should take care to cover each part of a badge's functionality,
and ideally, all code branches:

- Typical case
- Customized cases
- Server errors
- Not found errors
- Parse errors


Tutorial
--------

In this tutorial, we'll write tests for the Travis badge.
Here, you can see the [source code][travis-example]:

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

Before getting started, install the project dependencies if you haven't
already:

```
npm i
```

We'll start by creating a new module, `vendor/travis.js`, using this
boilerplate:

```js
'use strict';

const Joi = require('joi');                                // 1
const ServiceTester = require('./runner/service-tester');  // 2

const t = new ServiceTester('Travis', '/travis');          // 3
module.exports = t;                                        // 4
```

1. ??

We'll add all our tests to this ServiceTester object (2), which gets exported from
the module (4). The two arguments to the constructor (3) are the name of the service
and its URI prefix. The tester will prepend it to the URIs you provide later,
which saves copying and pasting.

?? (3) What is the name for?

Next we'll add a test for the typical case.

[![](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

The JSON format for this badge is `{ name: 'build', value: 'passing' }`.

Here's what our first test looks like:

```js
t.create('build status on default branch')
  .get('/rust-lang/rust.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'unknown')
  }));
```

The `create()` method gives the tester a new test. The chained-on calls come
from the API testing framework [IcedFrisby][]. Here's a [longer example][] and
the complete [API guide][IcedFrisby API].

`expectJSONTypes()` is an IcedFrisby method which accepts a [Joi][] schema.
Joi is a validation library that is build into IcedFrisby which you can use to
match based on a set of allowed strings, regexes, or specific values. You can
refer to their [API reference][Joi API].

Notice we don't have to specify `/travis` again, or even `localhost`. The test
runner handles that for us.

When defining an IcedFrisby test, typically you would invoke the `toss()`
method, to register the test. However, this is not necessary when using
ServiceTester.

[IcedFrisby]: https://github.com/MarkHerhold/IcedFrisby
[longer example]: https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
[IcedFrisby API]: https://github.com/MarkHerhold/IcedFrisby/blob/master/API.md
[Joi]: https://github.com/hapijs/joi
[Joi API]: https://github.com/hapijs/joi/blob/master/API.md

Run the test:

```
npm run test:vendor -- --only=travis
```

The `--only=` option indicates which service or services you want to test. You
can provide a comma-separated list.

The `--` tells the NPM CLI to pass the remaining arguments through to the test
runner.

Here's the output:

```
http://localhost:1111/try.html
  Travis
    build status on default branch
      ✓
  [ GET http://localhost:1111/travis/rust-lang/rust.json ] (265ms)


  1 passing (1s)
```

That's looking good!

Next we'll add a second test for a branch build.

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

Since in this case we know the exact badge which should be returned, we can
use the more concise `expectJSON()` in place of `expectJSONTypes()`.

Next, we want to cover the code in the `catch` block. To do this, we need to
trigger an exception. After studying the code, we realize this could happen on
a request without a Content-Disposition header.

Since we don't have an easy way to get the server to return a real repository
request without a Content-Disposition header, we will intercept the request
and provide our own mock response. We use the `intercept()` method provided by
the [icedfrisby-nock plugin][icedfrisby-nock]. It takes a setup function,
which returns an interceptor, and exposes the full API of the HTTP mocking
library [Nock][].

```js
t.create('missing content-disposition header')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .reply(200))
  .expectJSON({ name: 'build', value: 'invalid' });
```

Nock is fussy. All parts of a request must match perfectly for the mock to
take effect, including the method (in this case HEAD), scheme (https), host,
and path.

[icedfrisby-nock]: https://github.com/paulmelnikow/icedfrisby-nock#usage
[Nock]: https://github.com/node-nock/nock


Code coverage
-------------

By checking code coverage, we can make sure we've covered all our bases.

We can generate a coverage report and open it:

```
npm run coverage:test:vendor -- -- --only=travis
npm run coverage:report:open
```

Note the two sets of double dashes.

After searching `server.js` for the Travis code, we see that we've missed a
big block: the error branch in the request callback. To test that, we mock a
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


Complete example
----------------

```js
'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester('Travis', '/travis');
module.exports = t;

t.create('build status on default branch')
  .get('/rust-lang/rust.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('build status on named branch')
  .get('/rust-lang/rust/stable.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'unknown' });

t.create('missing content-disposition header')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .reply(200))
  .expectJSON({ name: 'build', value: 'invalid' });

t.create('connection error')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .replyWithError({ code: 'ECONNRESET' }))
  .expectJSON({ name: 'build', value: 'invalid' });
```


Further reading
---------------

- [IcedFrisby API][]
- [Joi API][]
- [icedfrisby-nock][]
- [Nock API](https://github.com/node-nock/nock#use)

[travis-example]: https://github.com/badges/shields/blob/bf373d11cd522835f198b50b4e1719027a0a2184/server.js#L431
