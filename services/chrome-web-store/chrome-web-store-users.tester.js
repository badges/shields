import { Agent, MockAgent, setGlobalDispatcher } from 'undici'
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
    '/chrome-web-store/users/alhjnofcnnpeaphgeakdhkebafjcpeae.svg',
  )

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/users/invalid-name-of-addon.json')
  .expectBadge({ label: 'users', message: 'not found' })

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
const mockAgent = new MockAgent()
t.create('Users (inaccessible)')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  // webextension-store-meta uses undici internally, so we can't mock it with nock
  .before(function () {
    setGlobalDispatcher(mockAgent)
    mockAgent.disableNetConnect()
  })
  .after(async function () {
    await mockAgent.close()
    setGlobalDispatcher(new Agent())
  })
  .expectBadge({ label: 'users', message: 'inaccessible' })
