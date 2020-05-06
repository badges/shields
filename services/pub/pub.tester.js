'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'PubVersion',
  title: 'Pub Version',
  pathPrefix: '/pub',
}))

t.create('package version').get('/v/box2d.json').expectBadge({
  label: 'pub',
  message: isVPlusTripleDottedVersion,
})

t.create('package pre-release version')
  .get('/v/box2d.json?include_prereleases')
  .expectBadge({
    label: 'pub',
    message: isVPlusTripleDottedVersion,
  })

t.create('package not found').get('/v/does-not-exist.json').expectBadge({
  label: 'pub',
  message: 'not found',
})

t.create('package version (legacy redirect: vpre)')
  .get('/vpre/box2d.svg')
  .expectRedirect('/pub/v/box2d.svg?include_prereleases')
