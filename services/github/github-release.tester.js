'use strict'

const Joi = require('@hapi/joi')
const { isSemver } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'GithubRelease',
  title: 'Github Release',
  pathPrefix: '/github',
}))

t.create('Release')
  .get('/v/release/expressjs/express.json')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Prerelease')
  .get('/v/release/expressjs/express.json?include_prereleases')
  .expectBadge({
    label: 'release',
    message: isSemver,
    color: Joi.string()
      .allow('blue', 'orange')
      .required(),
  })

t.create('Release (No releases)')
  .get('/v/release/badges/daily-tests.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

t.create('Prerelease (No releases)')
  .get('/v/release/badges/daily-tests.json?include_prereleases')
  .expectBadge({ label: 'release', message: 'no releases' })

t.create('Release (repo not found)')
  .get('/v/release/badges/helmets.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

//redirects
t.create('Release (legacy route: release)')
  .get('/release/photonstorm/phaser.svg', { followRedirect: false })
  .expectStatus(301)
  .expectHeader('Location', '/github/v/release/photonstorm/phaser.svg')

t.create('(pre-)Release (legacy route: release/all)')
  .get('/release/photonstorm/phaser/all.svg', { followRedirect: false })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/github/v/release/photonstorm/phaser.svg?include_prereleases'
  )

t.create('(pre-)Release (legacy route: release-pre)')
  .get('/release-pre/photonstorm/phaser.svg', { followRedirect: false })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/github/v/release/photonstorm/phaser.svg?include_prereleases'
  )
