'use strict'

const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('layers without a specified tag')
  .get('/_/alpine.json')
  .timeout(150000)
  .expectBadge({
    label: 'layers',
    message: nonNegativeInteger,
  })

t.create('layers with a specified tag')
  .get('/_/alpine/2.7.json')
  .timeout(150000)
  .expectBadge({
    label: 'layers',
    message: nonNegativeInteger,
  })

t.create('specified tag when repository has only one')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({ label: 'layers', message: 'not found' })

t.create('nonexistent repository')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'layers', message: 'not found' })

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
  .expectBadge({ label: 'layers', message: 'not found' })
