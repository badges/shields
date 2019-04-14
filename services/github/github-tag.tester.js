'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Tag')
  .get('/tag/photonstorm/phaser.json')
  .expectBadge({ label: 'tag', message: Joi.string() })

t.create('Tag (inc pre-release)')
  .get('/tag-pre/photonstorm/phaser.json')
  .expectBadge({ label: 'tag', message: Joi.string() })

t.create('Tag (repo not found)')
  .get('/tag/badges/helmets.json')
  .expectBadge({ label: 'tag', message: 'repo not found' })

const tagsFixture = [
  { name: 'cheese' }, // any old string
  { name: 'v1.3-beta3' }, // semver pre-release
  { name: 'v1.2' }, // semver release
]

t.create('Tag (mocked response, no pre-releases, semver ordering)')
  .get('/tag/foo/bar.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/foo/bar/tags')
      .reply(200, tagsFixture)
  )
  .expectBadge({ label: 'tag', message: 'v1.2', color: 'blue' })

t.create('Tag (mocked response, include pre-releases, semver ordering)')
  .get('/tag-pre/foo/bar.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/foo/bar/tags')
      .reply(200, tagsFixture)
  )
  .expectBadge({ label: 'tag', message: 'v1.3-beta3', color: 'orange' })

t.create('Tag (mocked response, date ordering)')
  .get('/tag-date/foo/bar.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/foo/bar/tags')
      .reply(200, tagsFixture)
  )
  .expectBadge({ label: 'tag', message: 'cheese', color: 'blue' })
