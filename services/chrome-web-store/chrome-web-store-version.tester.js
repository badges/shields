import { Agent, MockAgent, setGlobalDispatcher } from 'undici'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version').get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json').expectBadge({
  label: 'chrome web store',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'chrome web store', message: 'not found' })

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
const mockAgent = new MockAgent()
t.create('Version (inaccessible)')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  // webextension-store-meta uses undici internally, so we can't mock it with nock
  .before(function () {
    setGlobalDispatcher(mockAgent)
    mockAgent.disableNetConnect()
  })
  .after(async function () {
    await mockAgent.close()
    setGlobalDispatcher(new Agent())
  })
  .expectBadge({ label: 'chrome web store', message: 'inaccessible' })
