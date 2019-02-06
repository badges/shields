'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const isHexpmVersion = Joi.string().regex(/^v\d+.\d+.?\d?$/)

const t = (module.exports = new ServiceTester({ id: 'hexpm', title: 'Hex.pm' }))

t.create('downloads per week')
  .get('/dw/cowboy.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'downloads', value: isMetricOverTimePeriod })
  )

t.create('downloads per day')
  .get('/dd/cowboy.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'downloads', value: isMetricOverTimePeriod })
  )

t.create('downloads (zero for period)')
  .get('/dd/cowboy.json')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 }, // there is no 'day' key here
        releases: [{ version: '1.0' }],
        meta: { licenses: ['MIT'] },
      })
  )
  .expectJSON({ name: 'downloads', value: '0/day' })

t.create('downloads in total')
  .get('/dt/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('downloads (not found)')
  .get('/dt/this-package-does-not-exist.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

t.create('version')
  .get('/v/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'hex', value: isHexpmVersion }))

t.create('version (not found)')
  .get('/v/this-package-does-not-exist.json')
  .expectJSON({ name: 'hex', value: 'not found' })

t.create('license')
  .get('/l/cowboy.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'license',
      value: Joi.string().required(),
      color: 'blue',
    })
  )

t.create('license (multiple licenses)')
  .get('/l/cowboy.json?style=_shields_test')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 },
        releases: [{ version: '1.0' }],
        meta: { licenses: ['GPLv2', 'MIT'] },
      })
  )
  .expectJSON({
    name: 'licenses',
    value: 'GPLv2, MIT',
    color: 'blue',
  })

t.create('license (no license)')
  .get('/l/cowboy.json?style=_shields_test')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 100 },
        releases: [{ version: '1.0' }],
        meta: { licenses: [] },
      })
  )
  .expectJSON({
    name: 'license',
    value: 'Unknown',
    color: 'lightgrey',
  })

t.create('license (not found)')
  .get('/l/this-package-does-not-exist.json')
  .expectJSON({ name: 'license', value: 'not found' })
