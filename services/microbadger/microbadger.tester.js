'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isFileSize } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'microbadger', title: 'MicroBadger' })
module.exports = t

t.create('image size without a specified tag')
  .get('/image-size/fedora/apache.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('image size with a specified tag')
  .get('/image-size/fedora/apache/latest.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('layers without a specified tag')
  .get('/layers/_/alpine.json')
  .expectBadge({
    label: 'layers',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('layers with a specified tag')
  .get('/layers/_/alpine/2.7.json')
  .expectBadge({
    label: 'layers',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('specified tag when repository has only one')
  .get('/layers/_/alpine/wrong-tag.json')
  .expectBadge({ label: 'layers', message: 'not found' })

t.create('nonexistent repository')
  .get('/layers/_/unknown.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/library/unknown')
      .reply(404)
  )
  .expectBadge({ label: 'layers', message: 'not found' })

t.create('nonexistent tag')
  .get('/layers/_/unknown/wrong-tag.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/library/unknown')
      .reply(200, { Versions: [] })
  )
  .expectBadge({ label: 'layers', message: 'not found' })

t.create('server error')
  .get('/image-size/_/hello-world.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/library/hello-world')
      .reply(500, 'Something went wrong')
  )
  .expectBadge({ label: 'image size', message: 'inaccessible' })

t.create('connection error')
  .get('/image-size/_/hello-world.json')
  .networkOff()
  .expectBadge({ label: 'image size', message: 'inaccessible' })

t.create('unexpected response')
  .get('/image-size/_/hello-world.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/library/hello-world')
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'image size', message: 'error' })

t.create('missing download size')
  .get('/image-size/puppet/puppetserver.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/puppet/puppetserver')
      .reply(200, {})
  )
  .expectBadge({ label: 'image size', message: 'unknown' })
