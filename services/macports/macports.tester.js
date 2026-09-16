import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('macports (valid)').get('/git.json').expectBadge({
  label: 'macports',
  message: isVPlusDottedVersionNClausesWithOptionalSuffix,
})

t.create('macports (not found)')
  .get('/not-a-real-port.json')
  .expectBadge({ label: 'macports', message: 'not found' })
