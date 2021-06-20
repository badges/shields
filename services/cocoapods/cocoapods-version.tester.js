import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version (valid)').get('/AFNetworking.json').expectBadge({
  label: 'pod',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'pod', message: 'not found' })
