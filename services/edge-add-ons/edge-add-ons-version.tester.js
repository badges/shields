import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Version').get('/cnlefmmeadmemmdciolhbnfeacpdfbkd.json').expectBadge({
  label: 'edge add-ons',
  message: isVPlusDottedVersionNClauses,
})

t.create('Version (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'edge add-ons', message: 'not found' })
