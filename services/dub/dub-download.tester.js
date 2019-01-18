'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const isDownloadsColor = Joi.equal(
  'red',
  'yellow',
  'yellowgreen',
  'green',
  'brightgreen'
)

const t = (module.exports = new ServiceTester({
  id: 'dub',
  title: 'DubDownloads',
}))

t.create('total downloads (valid)')
  .get('/dt/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
      color: isDownloadsColor,
    })
  )

t.create('total downloads, specific version (valid)')
  .get('/dt/vibe-d/0.8.4.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@0.8.4',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]?$/),
      color: isDownloadsColor,
    })
  )
  .timeout(15000)

t.create('total downloads, latest version (valid)')
  .get('/dt/vibe-d/latest.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@latest',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]?$/),
      color: isDownloadsColor,
    })
  )

t.create('daily downloads (valid)')
  .get('/dd/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      color: isDownloadsColor,
    })
  )

t.create('weekly downloads (valid)')
  .get('/dw/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      color: isDownloadsColor,
    })
  )

t.create('monthly downloads (valid)')
  .get('/dm/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      color: isDownloadsColor,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })
