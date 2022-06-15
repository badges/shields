import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version')
  .get('/v/author/TopAndDownButtonsEverywhere.json')
  .expectBadge({
    label: 'openuserjs',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (invalid parameters)')
  .get('/v/author/NotAScript4.json')
  .expectBadge({ label: 'openuserjs', message: 'user or project not found' })

t.create('Version (no version found)')
  .get('/v/author/Example_no_version.json')
  .expectBadge({ label: 'openuserjs', message: 'version not found' })
