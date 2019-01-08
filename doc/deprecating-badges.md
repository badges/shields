# Deprecating Badges

When a service that Shields integrates with shuts down, those badges will no longer work and need to be deprecated within Shields.

Deprecating a badge involves 3 steps:

1.  Adding an entry for the service to the deprecated service list in `deprecated-services.js`
2.  Updating the service code to use the `DeprecatedService` class
3.  Updating the service tests to reflect the new behavior of the deprecated service

## Update Deprecated Service List

All deprecated services are enumerated in the `deprecated-services.js` [file](https://github.com/badges/shields/blob/master/lib/deprecated-services.js) which can be found in the `lib` directory (`./lib/deprecated-services.js`).

Add a key for the service with the corresponding date for deprecation, for example: `nsp: new Date('2018-12-13')`, to the `deprecatedServices` object.

## Update Service Implementation

Locate the source file(s) for the service, which can be found in `*.service.js` files located within the directory for the service (`./services/:service-name/`) such as `./services/imagelayers/imagelayers.service.js`.

Replace the existing service class implementation with the `DeprecatedService` class from `./services/deprecated-service.js` using the respective `category`, `url`, and `label` values for that service. For example:

```js
'use strict'

const deprecatedService = require('../deprecated-service')

// image layers integration - deprecated as of November 2018.
module.exports = deprecatedService({
  category: 'size',
  url: {
    base: 'imagelayers',
    format: '(?:.+)',
  },
  label: 'imagelayers',
})
```

## Update Service Tests

Locate the test file(s) for the service, which can be found in `*.tester.js` files located in the service directory (`./services/:service-name/`), such as `./services/imagelayers/imagelayers.tester.js`.

With `DeprecatedService` classes we cannot use the utility functions from `create-service-tester.js` so you will need to create the `ServiceTester` class directly. For example:

```js
const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
}))
```

Next you will need to replace/refactor the existing tests to validate the new deprecated badge behavior for this service. Deprecated badges always return a message of `no longer available` (such as `imagelayers | no longer available`) so the tests need to be updated to reflect that message value. For example:

```js
t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectJSON({
    name: 'imagelayers',
    value: 'no longer available',
  })
```

Make sure to have a live (non-mocked) test for each badge the service provides that validates the each badge returns the `no longer available` message.

Here is an example of what the final result would look like for a test file:

```js
'use strict'

const ServiceTester = require('../service-tester')
const t = (module.exports = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
}))

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectJSON({
    name: 'imagelayers',
    value: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectJSON({
    name: 'imagelayers',
    value: 'no longer available',
  })
```

## Additional Information

Some other information that may be useful:

- [Contributing Docs](../CONTRIBUTING.md)
- [Badge Tutorial](./TUTORIAL.md)
- [Service Tests Tutorial](./service-tests.md)
- Previous Pull Requests that deprecated badges like [#2352](https://github.com/badges/shields/pull/2352) and [#2410](https://github.com/badges/shields/pull/2410)
