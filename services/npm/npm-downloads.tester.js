'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')
const { colorScheme: colorsB } = require('../test-helpers')

const t = new ServiceTester({
  id: 'NpmDownloads',
  title: 'NpmDownloads',
  pathPrefix: '/npm',
})
module.exports = t

t.create('total downloads of left-pad')
  .get('/dt/left-pad.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
      colorB: colorsB.brightgreen,
    })
  )

t.create('total downloads of @cycle/core')
  .get('/dt/@cycle/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('total downloads of package with zero downloads')
  .get('/dt/package-no-downloads.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.npmjs.org')
      .get('/downloads/range/1000-01-01:3000-01-01/package-no-downloads')
      .reply(200, {
        downloads: [{ downloads: 0, day: '2018-01-01' }],
      })
  )
  .expectJSON({ name: 'downloads', value: '0', colorB: colorsB.red })

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
  .expectJSON({ name: 'downloads', value: '5' })

t.create('total downloads when network is off')
  .get('/dt/@cycle/core.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'downloads',
    value: 'inaccessible',
    colorB: colorsB.lightgray,
  })

t.create('total downloads of unknown package')
  .get('/dt/npm-api-does-not-have-this-package.json?style=_shields_test')
  .expectJSON({
    name: 'downloads',
    value: 'package not found or too new',
    colorB: colorsB.red,
  })
