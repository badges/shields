import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version')
  .get('/v/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({
    label: 'openuserjs',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (invalid parameters)')
  .get('/v/DenverCoder1/NotAScript4.json')
  .expectBadge({ label: 'openuserjs', message: 'user or project not found' })

t.create('Version (no version found)')
  .get('/v/myclone/Buienradar_skip_position_popup.json')
  .expectBadge({ label: 'openuserjs', message: 'version not found' })
