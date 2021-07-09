import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version').get('/IndieGala-Helper.json').expectBadge({
  label: 'mozilla add-on',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })
