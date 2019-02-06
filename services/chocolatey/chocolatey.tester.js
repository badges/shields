'use strict'

const Joi = require('joi')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chocolatey',
  title: 'Chocolatey',
}))

// downloads

t.create('total downloads (valid)')
  .get('/dt/scriptcs.json')
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
  .get('/v/scriptcs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chocolatey',
      value: isVPlusDottedVersionNClauses,
    })
  )

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({ name: 'chocolatey', value: 'not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/scriptcs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chocolatey',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({ name: 'chocolatey', value: 'not found' })
