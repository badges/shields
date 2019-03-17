'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('package version')
  .get('/v/box2d.json')
  .expectBadge({
    label: 'pub',
    message: isVPlusTripleDottedVersion,
  })

t.create('package pre-release version')
  .get('/vpre/box2d.json')
  .expectBadge({
    label: 'pub',
    message: isVPlusTripleDottedVersion,
  })

t.create('package not found')
  .get('/v/does-not-exist.json')
  .expectBadge({
    label: 'pub',
    message: 'not found',
  })
