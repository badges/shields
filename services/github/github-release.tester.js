import Joi from 'joi'
import { isSemver } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubRelease',
  title: 'Github Release',
  pathPrefix: '/github',
})

t.create('Release')
  .get('/v/release/expressjs/express.json')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Prerelease')
  .get('/v/release/expressjs/express.json?include_prereleases')
  .expectBadge({
    label: 'release',
    message: isSemver,
    color: Joi.string().allow('blue', 'orange').required(),
  })

// basic query parameter testing. application of param in transform
// logic is tested via unit tests in github-release.spec.js
t.create('Release (release name instead of tag name)')
  .get('/v/release/expressjs/express.json?display_name=release')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Release (No releases)')
  .get('/v/release/badges/daily-tests.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

t.create('Prerelease (No releases)')
  .get('/v/release/badges/daily-tests.json?include_prereleases')
  .expectBadge({ label: 'release', message: 'no releases' })

t.create('Release (repo not found)')
  .get('/v/release/badges/helmets.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

// redirects
t.create('Release (legacy route: release)')
  .get('/release/photonstorm/phaser.svg')
  .expectRedirect('/github/v/release/photonstorm/phaser.svg')

t.create('(pre-)Release (legacy route: release/all)')
  .get('/release/photonstorm/phaser/all.svg')
  .expectRedirect(
    '/github/v/release/photonstorm/phaser.svg?include_prereleases'
  )

t.create('(pre-)Release (legacy route: release-pre)')
  .get('/release-pre/photonstorm/phaser.svg')
  .expectRedirect(
    '/github/v/release/photonstorm/phaser.svg?include_prereleases'
  )
