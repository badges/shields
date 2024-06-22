import Joi from 'joi'
import { isSemver } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubLatestBranchRelease',
  title: 'Github Latest Branch Release',
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

t.create('Latest release (release)')
  .get('/v/release/expressjs/express.json?display_name=release')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Release (No releases)')
  .get('/v/release/badges/daily-tests.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })

t.create('Release (repo not found)')
  .get('/v/release/badges/helmets.json')
  .expectBadge({ label: 'release', message: 'no releases or repo not found' })
