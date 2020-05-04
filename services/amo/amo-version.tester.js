'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Version').get('/IndieGala-Helper.json').expectBadge({
  label: 'mozilla add-on',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })
