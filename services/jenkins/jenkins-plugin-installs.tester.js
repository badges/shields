'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// total installs

t.create('total installs | valid')
  .get('/view-job-filters.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('total installs | not found')
  .get('/not-a-plugin.json')
  .expectJSON({ name: 'installs', value: 'plugin not found' })

// version installs

t.create('version installs | valid: numeric version')
  .get('/view-job-filters/1.26.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs@1.26',
      value: isMetric,
    })
  )

t.create('version installs | valid: alphanumeric version')
  .get('/view-job-filters/1.27-DRE1.00.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs@1.27-DRE1.00',
      value: isMetric,
    })
  )

t.create('version installs | not found: non-existent plugin')
  .get('/not-a-plugin/1.26.json')
  .expectJSON({ name: 'installs', value: 'plugin not found' })

t.create('version installs | not found: non-existent version')
  .get('/view-job-filters/1.1-NOT-FOUND.json')
  .expectJSON({ name: 'installs', value: 'version not found' })
