import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version (valid)').get('/git.json').expectBadge({
  label: 'macports',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-real-port.json')
  .expectBadge({ label: 'macports', message: 'port not found' })
