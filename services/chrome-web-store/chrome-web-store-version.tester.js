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
t.create('Version (inaccessible)')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'chrome web store', message: 'inaccessible' })
