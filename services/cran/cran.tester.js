import { ServiceTester } from '../tester.js'
import { isVPlusTripleDottedVersion } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'cran',
  title: 'CRAN/METACRAN',
})

t.create('version (valid)').get('/v/devtools.json').expectBadge({
  label: 'cran',
  message: isVPlusTripleDottedVersion,
})

t.create('version (not found)')
  .get('/v/some-bogus-package.json')
  .expectBadge({ label: 'cran', message: 'not found' })

t.create('license (valid)')
  .get('/l/devtools.json')
  .expectBadge({ label: 'license', message: 'MIT + file LICENSE' })

t.create('license (not found)')
  .get('/l/some-bogus-package.json')
  .expectBadge({ label: 'cran', message: 'not found' })
