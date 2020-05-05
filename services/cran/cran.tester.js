'use strict'

const { ServiceTester } = require('../tester')
const { isVPlusTripleDottedVersion } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'cran',
  title: 'CRAN/METACRAN',
}))

t.create('version (valid)').get('/v/devtools.json').expectBadge({
  label: 'cran',
  message: isVPlusTripleDottedVersion,
})

t.create('version (not found)')
  .get('/v/some-bogus-package.json')
  .expectBadge({ label: 'cran', message: 'not found' })

t.create('license (valid)')
  .get('/l/devtools.json')
  .expectBadge({ label: 'license', message: 'GPL (>= 2)' })

t.create('license (not found)')
  .get('/l/some-bogus-package.json')
  .expectBadge({ label: 'cran', message: 'not found' })
