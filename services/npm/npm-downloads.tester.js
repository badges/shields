'use strict'

const { ServiceTester } = require('../tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({
  id: 'NpmDownloads',
  title: 'NpmDownloads',
  pathPrefix: '/npm',
})
module.exports = t

t.create('total downloads of left-pad')
  .get('/dt/left-pad.json?style=_shields_test')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
    color: 'brightgreen',
  })

t.create('total downloads of @cycle/core')
  .get('/dt/@cycle/core.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('total downloads of package with zero downloads')
  .get('/dt/package-no-downloads.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.npmjs.org')
      .get('/downloads/range/1000-01-01:3000-01-01/package-no-downloads')
      .reply(200, {
        downloads: [{ downloads: 0, day: '2018-01-01' }],
      })
  )
  .expectBadge({ label: 'downloads', message: '0', color: 'red' })

t.create('exact total downloads value')
  .get('/dt/exact-value.json')
  .intercept(nock =>
    nock('https://api.npmjs.org')
      .get('/downloads/range/1000-01-01:3000-01-01/exact-value')
      .reply(200, {
        downloads: [
          { downloads: 2, day: '2018-01-01' },
          { downloads: 3, day: '2018-01-02' },
        ],
      })
  )
  .expectBadge({ label: 'downloads', message: '5' })

t.create('total downloads of unknown package')
  .get('/dt/npm-api-does-not-have-this-package.json?style=_shields_test')
  .expectBadge({
    label: 'downloads',
    message: 'package not found or too new',
    color: 'red',
  })
