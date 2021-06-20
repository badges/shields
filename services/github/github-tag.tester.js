import Joi from 'joi'
import { isSemver } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubTag',
  title: 'Github Tag',
  pathPrefix: '/github',
})

t.create('Tag')
  .get('/v/tag/expressjs/express.json')
  .expectBadge({ label: 'tag', message: isSemver, color: 'blue' })

t.create('Tag (inc pre-release)')
  .get('/v/tag/expressjs/express.json?include_prereleases')
  .expectBadge({
    label: 'tag',
    message: isSemver,
    color: Joi.string().allow('blue', 'orange').required(),
  })

t.create('Tag (no tags)')
  .get('/v/tag/badges/daily-tests.json')
  .expectBadge({ label: 'tag', message: 'no tags found' })

t.create('Tag (repo not found)')
  .get('/v/tag/badges/helmets.json')
  .expectBadge({ label: 'tag', message: 'repo not found' })

// redirects
t.create('Tag (legacy route: tag)')
  .get('/tag/photonstorm/phaser.svg')
  .expectRedirect('/github/v/tag/photonstorm/phaser.svg?sort=semver')

t.create('Tag (legacy route: tag-pre)')
  .get('/tag-pre/photonstorm/phaser.svg')
  .expectRedirect(
    '/github/v/tag/photonstorm/phaser.svg?include_prereleases&sort=semver'
  )

t.create('Tag (legacy route: tag-date)')
  .get('/tag-date/photonstorm/phaser.svg')
  .expectRedirect('/github/v/tag/photonstorm/phaser.svg')
