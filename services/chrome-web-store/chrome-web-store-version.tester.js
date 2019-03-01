'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store/v',
  title: 'Chrome Web Store Version',
}))

t.create('Version')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'chrome web store',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'chrome web store', message: 'not found' })
