import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('marketplace version').get('/notepad4e.json').expectBadge({
  label: 'eclipse marketplace',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'eclipse marketplace',
    message: 'solution not found',
  })
