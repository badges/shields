'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isVPlusTripleDottedVersion } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'cran',
  title: 'CRAN/METACRAN',
}))

t.create('version (valid)')
  .get('/v/devtools.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cran',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('version (not found)')
  .get('/v/some-bogus-package.json')
  .expectJSON({ name: 'cran', value: 'not found' })

t.create('license (valid)')
  .get('/l/devtools.json')
  .expectJSON({ name: 'license', value: 'GPL (>= 2)' })

t.create('license (not found)')
  .get('/l/some-bogus-package.json')
  .expectJSON({ name: 'cran', value: 'not found' })
