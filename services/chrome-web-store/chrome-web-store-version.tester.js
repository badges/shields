'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Version')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'chrome web store',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'chrome web store', message: 'not found' })

t.create('Version (inaccessible)')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'chrome web store', message: 'inaccessible' })
