'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = new ServiceTester({
  id: 'maven-metadata',
  title: 'maven-metadata badge',
})
module.exports = t

t.create('valid maven-metadata.xml uri')
  .get(
    '/v/http/central.maven.org/maven2/com/google/code/gson/gson/maven-metadata.xml.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'maven',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )
