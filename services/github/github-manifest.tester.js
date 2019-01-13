'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubManifest',
  title: 'GithubManifest',
  pathPrefix: '/github/manifest-json',
}))

t.create('Manifest version')
  .get('/v/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'version',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Manifest name')
  .get('/n/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'name', value: 'IndieGala Helper' })

t.create('Manifest array')
  .get('/permissions/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'permissions',
      value: Joi.string().regex(/.*?,/),
    })
  )

t.create('Manifest object')
  .get('/background/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'manifest', value: 'invalid key value' })

t.create('Manifest invalid json response')
  .get('/v/RedSparr0w/not-a-real-project.json')
  .expectJSON({
    name: 'version',
    value: 'repo not found, branch not found, or manifest.json missing',
  })
