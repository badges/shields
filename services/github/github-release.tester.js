'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectBadge({ label: 'release', message: isVPlusTripleDottedVersion })

t.create('Release (repo not found)')
  .get('/release/badges/helmets.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

t.create('Prerelease')
  .get('/release-pre/photonstorm/phaser.json')
  .expectBadge({ label: 'release', message: isVPlusTripleDottedVersion })

t.create('Prerelease (repo not found)')
  .get('/release-pre/badges/helmets.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

t.create('No releases')
  .get('/release/badges/daily-tests.json')
  .expectBadge({
    label: 'release',
    message: 'no releases or repo not found',
  })
