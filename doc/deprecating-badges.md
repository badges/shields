# Deprecating Badges

When a service that Shields integrates with shuts down, those badges will no longer work and need to be deprecated within Shields.

Deprecating a badge involves two steps:

1.  Updating the service code to use the `DeprecatedService` class
2.  Updating the service tests to reflect the new behavior of the deprecated service

## Update Service Implementation

Locate the source file(s) for the service, which can be found in `*.service.js` files located within the directory for the service (`./services/:service-name/`) such as `./services/imagelayers/imagelayers.service.js`.

Replace the existing service class implementation with the `DeprecatedService` class from `./core/base-service/deprecated-service.js` using the respective `category`, `route`, and `label` values for that service. For example:

```js
import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'size',
  route: {
    base: 'imagelayers',
    format: '(?:.+?)',
  },
  label: 'imagelayers',
  dateAdded: new Date('2019-xx-xx'), // Be sure to update this with today's date!
})
```

## Update Service Tests

Locate the test file(s) for the service, which can be found in `*.tester.js` files located in the service directory (`./services/:service-name/`), such as `./services/imagelayers/imagelayers.tester.js`.

With `DeprecatedService` classes we cannot use `createServiceTester()` so you will need to create the `ServiceTester` class directly. For example:

```js
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
})
```

Next you will need to replace/refactor the existing tests to validate the new deprecated badge behavior for this service. Deprecated badges always return a message of `no longer available` (such as `imagelayers | no longer available`) so the tests need to be updated to reflect that message value. For example:

```js
t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectBadge({
    label: 'imagelayers',
    message: 'no longer available',
  })
```

Make sure to have a live (non-mocked) test for each badge the service provides that validates the each badge returns the `no longer available` message.

Here is an example of what the final result would look like for a test file:

```js
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
})

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectBadge({
    label: 'imagelayers',
    message: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectBadge({
    label: 'imagelayers',
    message: 'no longer available',
  })
```

## What Happens Next?

Once a service is deprecated, we'll keep the deprecation notice for a minimum of one year. During that time, the badge will render as follows:
![](https://img.shields.io/badge/gratipay-no%20longer%20available-inactive)

Past that point, all related code will be deleted, and a not found error will be rendered instead:
![](https://img.shields.io/badge/404-badge%20not%20found-critical)

Here is a listing of all deleted badges that were once part of the Shields.io service:

- bitHound
- Cauditor
- CocoaPods Apps
- CocoaPods Downloads
- Codetally
- continuousphp
- Coverity
- Dockbit
- Dotnet Status
- Gemnasium
- Gratipay/Gittip
- ImageLayers
- Issue Stats
- JitPack Downloads
- Leanpub
- Libscore
- Magnum CI
- NSP
- PHP Eye
- Snap CI
- VersionEye
- Waffle

## Additional Information

Some other information that may be useful:

- [Contributing Docs](../CONTRIBUTING.md)
- [Badge Tutorial](./TUTORIAL.md)
- [Service Tests Tutorial](./service-tests.md)
- Previous Pull Requests that deprecated badges like [#2352](https://github.com/badges/shields/pull/2352) and [#2410](https://github.com/badges/shields/pull/2410)
