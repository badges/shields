'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('iTunes version (valid)').get('/324684580.json').expectBadge({
  label: 'itunes app store',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('iTunes version (not found)')
  .get('/9.json')
  .expectBadge({ label: 'itunes app store', message: 'not found' })

t.create('iTunes version (invalid)')
  .get('/x.json')
  .expectBadge({ label: 'itunes app store', message: 'invalid' })
