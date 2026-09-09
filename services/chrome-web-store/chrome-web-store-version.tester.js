import { Agent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
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
const failingAgent = new Agent({
  connect(_options, callback) {
    callback(new Error('mock connection failure'))
  },
})
let previousDispatcher
t.create('Version (inaccessible)')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  // webextension-store-meta uses undici internally, so we can't mock it with nock
  .before(function () {
    previousDispatcher = getGlobalDispatcher()
    setGlobalDispatcher(failingAgent)
  })
  .after(async function () {
    setGlobalDispatcher(previousDispatcher)
    await failingAgent.close()
  })
  .expectBadge({ label: 'chrome web store', message: 'inaccessible' })
