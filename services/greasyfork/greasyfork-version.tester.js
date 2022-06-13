import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version').get('/407466.json').expectBadge({
  label: 'greasy fork',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/000000.json')
  .expectBadge({ label: 'greasy fork', message: 'not found' })
