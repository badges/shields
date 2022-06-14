import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version')
  .get('/v/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({
    label: 'openuserjs',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (not found)')
  .get('/v/NotAUser/NotAScript.json')
  .expectBadge({ label: 'openuserjs', message: 'invalid' })
