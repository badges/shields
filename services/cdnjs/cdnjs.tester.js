import { isVPlusTripleDottedVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('cdnjs (valid)').get('/jquery.json').expectBadge({
  label: 'cdnjs',
  message: isVPlusTripleDottedVersion,
})

t.create('cdnjs (not found)')
  .get('/not-a-library.json')
  .expectBadge({ label: 'cdnjs', message: 'not found' })
