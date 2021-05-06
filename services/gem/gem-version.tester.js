'use strict'

const {
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)').get('/formatador.json').expectBadge({
  label: 'gem',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'gem', message: 'not found' })

t.create('latest version (valid)')
  .get('/flame/latest.json')
  .expectBadge({
    label: 'gem',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('latest version (not found)')
  .get('/not-a-package/latest.json')
  .expectBadge({ label: 'gem', message: 'not found' })
