import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'ChromeWebStoreUsers',
  title: 'Chrome Web Store Users',
  pathPrefix: '/chrome-web-store',
})

t.create('Downloads (redirect)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.svg')
  .expectRedirect(
    '/chrome-web-store/users/alhjnofcnnpeaphgeakdhkebafjcpeae.svg'
  )

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/users/invalid-name-of-addon.json')
  .expectBadge({ label: 'users', message: 'not found' })

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
t.create('Users (inaccessible)')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'users', message: 'inaccessible' })
