'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isSemver } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'PuppetForgeModules',
  title: 'PuppetForge Modules',
  pathPrefix: '/puppetforge',
}))

t.create('PDK version')
  .get('/pdk-version/tragiccode/azure_key_vault.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pdk version',
      value: isSemver,
    })
  )

t.create("PDK version of a library that doesn't use the PDK")
  .get('/pdk-version/camptocamp/openssl.json')
  .expectJSON({
    name: 'pdk version',
    value: 'none',
  })
