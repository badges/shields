import { createServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Version')
  .get('/just-perfection-desktop@just-perfection.json')
  .expectBadge({ label: 'version', message: isVPlusDottedVersionAtLeastOne })

t.create('Version (not found)').get('/non-existent.json').expectBadge({
  label: 'version',
  message: 'no active version found',
})
