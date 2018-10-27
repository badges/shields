'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')
const { colorScheme } = require('../test-helpers')

const isHexpmVersion = Joi.string().regex(/^v\d+.\d+.?\d?$/)

const t = new ServiceTester({ id: 'hexpm', title: 'Hex.pm' })
module.exports = t

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

t.create('downloads in total')
  .get('/dt/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('version')
  .get('/v/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'hex', value: isHexpmVersion }))

t.create('license')
  .get('/l/cowboy.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'license',
      value: Joi.string().required(),
      colorB: colorScheme.blue,
    })
  )

t.create('license (multiple licenses)')
  .get('/l/cowboy.json?style=_shields_test')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 0, week: 0, day: 0 },
        releases: [{ version: '1.0' }],
        meta: { licenses: ['GPLv2', 'MIT'] },
      })
  )
  .expectJSON({
    name: 'licenses',
    value: 'GPLv2, MIT',
    colorB: colorScheme.blue,
  })

t.create('license (no license)')
  .get('/l/cowboy.json?style=_shields_test')
  .intercept(nock =>
    nock('https://hex.pm/')
      .get('/api/packages/cowboy')
      .reply(200, {
        downloads: { all: 0, week: 0, day: 0 },
        releases: [{ version: '1.0' }],
        meta: { licenses: [] },
      })
  )
  .expectJSON({
    name: 'license',
    value: 'Unknown',
    colorB: colorScheme.lightgrey,
  })
