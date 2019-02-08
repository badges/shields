'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'resharper',
  title: 'ReSharper',
}))

// downloads

t.create('total downloads (valid)')
  .get('/dt/ReSharper.Nuke.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

// version

t.create('version (valid)')
  .get('/v/ReSharper.Nuke.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'resharper',
      value: isVPlusDottedVersionNClauses,
    })
  )

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({ name: 'resharper', value: 'not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/ReSharper.Nuke.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'resharper',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({ name: 'resharper', value: 'not found' })
