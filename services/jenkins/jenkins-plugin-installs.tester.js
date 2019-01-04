'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

// total installs

t.create('total installs | valid')
  .get('/view-job-filters.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs',
      value: isMetric,
    })
  )

t.create('total installs | invalid: no "installations" property')
  .get('/view-job-filters.json')
  .intercept(nock =>
    nock('https://stats.jenkins.io')
      .get('/plugin-installation-trend/view-job-filters.stats.json')
      .reply(200, { name: 'view-job-filters' })
  )
  .expectJSON({ name: 'installs', value: 'invalid response data' })

t.create('total installs | invalid: empty "installations" object')
  .get('/view-job-filters.json')
  .intercept(nock =>
    nock('https://stats.jenkins.io')
      .get('/plugin-installation-trend/view-job-filters.stats.json')
      .reply(200, { name: 'view-job-filters', installations: {} })
  )
  .expectJSON({ name: 'installs', value: 'invalid response data' })

t.create('total installs | invalid: non-numeric "installations" key')
  .get('/view-job-filters.json')
  .intercept(nock =>
    nock('https://stats.jenkins.io')
      .get('/plugin-installation-trend/view-job-filters.stats.json')
      .reply(200, { name: 'view-job-filters', installations: { abc: 12345 } })
  )
  .expectJSON({ name: 'installs', value: 'invalid response data' })

t.create('total installs | not found')
  .get('/not-a-plugin.json')
  .expectJSON({ name: 'installs', value: 'plugin not found' })

t.create('total installs | inaccessible: connection error')
  .get('/view-job-filters.json')
  .networkOff()
  .expectJSON({ name: 'installs', value: 'inaccessible' })

// version installs

t.create('version installs | valid: numeric version')
  .get('/view-job-filters/1.26.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs@1.26',
      value: isMetric,
    })
  )

t.create('version installs | valid: alpha-numeric version')
  .get('/view-job-filters/1.27-DRE1.00.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'installs@1.27-DRE1.00',
      value: isMetric,
    })
  )

t.create('version installs | invalid: "installationsPerVersion" missing')
  .get('/view-job-filters/1.26.json')
  .intercept(nock =>
    nock('https://stats.jenkins.io')
      .get('/plugin-installation-trend/view-job-filters.stats.json')
      .reply(200, { name: 'view-job-filters' })
  )
  .expectJSON({ name: 'installs', value: 'invalid response data' })

t.create('version installs | invalid: empty "installationsPerVersion" object')
  .get('/view-job-filters/1.26.json')
  .intercept(nock =>
    nock('https://stats.jenkins.io')
      .get('/plugin-installation-trend/view-job-filters.stats.json')
      .reply(200, { name: 'view-job-filters', installationsPerVersion: {} })
  )
  .expectJSON({ name: 'installs', value: 'invalid response data' })

t.create('version installs | not found: non-existent plugin')
  .get('/not-a-plugin/1.26.json')
  .expectJSON({ name: 'installs', value: 'plugin not found' })

t.create('version installs | not found: non-existent version')
  .get('/view-job-filters/1.1-NOT-FOUND.json')
  .expectJSON({ name: 'installs', value: 'version not found' })

t.create('version installs | inaccessible: connection error')
  .get('/view-job-filters/1.26.json')
  .networkOff()
  .expectJSON({ name: 'installs', value: 'inaccessible' })

module.exports = t
