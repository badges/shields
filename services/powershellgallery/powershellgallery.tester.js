'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

const t = new ServiceTester({
  id: 'powershellgallery',
  title: 'PowerShell Gallery',
})
module.exports = t

t.create('total downloads (valid)')
  .get('/dt/ACMESharp.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

t.create('version (valid)')
  .get('/v/ACMESharp.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'powershell gallery',
      value: isVPlusDottedVersionNClauses,
    })
  )

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({ name: 'powershell gallery', value: 'not found' })

t.create('version (pre) (valid)')
  .get('/vpre/ACMESharp.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'powershell gallery',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({ name: 'powershell gallery', value: 'not found' })
