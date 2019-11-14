'use strict'

const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('image size without a specified tag')
  .get('/fedora/apache.json')
  .timeout(150000)
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('image size with a specified tag')
  .get('/fedora/apache/latest.json')
  .timeout(150000)
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('missing download size')
  .get('/puppet/puppetserver.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/puppet/puppetserver')
      .reply(200, {
        LayerCount: 1,
        Versions: [],
      })
  )
  .expectBadge({ label: 'image size', message: 'unknown' })

t.create('specified tag when repository has only one')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({ label: 'image size', message: 'not found' })

t.create('nonexistent repository')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'image size', message: 'not found' })

t.create('nonexistent tag')
  .get('/_/unknown/wrong-tag.json')
  .intercept(nock =>
    nock('https://api.microbadger.com')
      .get('/v1/images/library/unknown')
      .reply(200, {
        LayerCount: 1,
        DownloadSize: 1,
        Versions: [],
      })
  )
  .expectBadge({ label: 'image size', message: 'not found' })
