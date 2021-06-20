import {
  isVPlusDottedVersionAtLeastOne,
  withRegex,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version (valid)').get('/formatador.json').expectBadge({
  label: 'gem',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'gem', message: 'not found' })

// this is the same as isVPlusDottedVersionNClausesWithOptionalSuffix from test-validators.js
// except that it also accepts regexes like 5.0.0.rc5 - the . before the rc5 is not accepted in the original
const isVPlusDottedVersionNClausesWithOptionalSuffix = withRegex(
  /^v\d+(\.\d+)*([-+~.].*)?$/
)
t.create('version including prereleases (valid)')
  .get('/flame.json?include_prereleases')
  .expectBadge({
    label: 'gem',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version including prereleases (not found)')
  .get('/not-a-package.json?include_prereleases')
  .expectBadge({ label: 'gem', message: 'not found' })
