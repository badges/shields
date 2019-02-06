'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('total downloads (valid)')
  .get('/dt/rails.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'gem not found' })

t.create('version downloads (valid, stable version)')
  .get('/dv/rails/stable.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@stable',
      value: isMetric,
    })
  )

t.create('version downloads (valid, specific version)')
  .get('/dv/rails/4.1.0.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@4.1.0',
      value: isMetric,
    })
  )

t.create('version downloads (package not found)')
  .get('/dv/not-a-package/4.1.0.json')
  .expectJSON({ name: 'downloads', value: 'gem not found' })

t.create('version downloads (valid package, invalid version)')
  .get('/dv/rails/not-a-version.json')
  .expectJSON({
    name: 'downloads',
    value: 'version should be "stable" or valid semver',
  })

t.create('version downloads (valid package, version not found)')
  .get('/dv/rails/8.8.8.json')
  .expectJSON({
    name: 'downloads',
    value: 'version not found',
  })

t.create('version downloads (valid package, version not specified)')
  .get('/dv/rails.json')
  .expectJSON({
    name: 'downloads',
    value: 'version downloads requires a version',
  })

t.create('latest version downloads (valid)')
  .get('/dtv/rails.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads@latest',
      value: isMetric,
    })
  )

t.create('latest version downloads (not found)')
  .get('/dtv/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'gem not found' })
