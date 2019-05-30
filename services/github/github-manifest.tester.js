'use strict'

const Joi = require('@hapi/joi')
const { ServiceTester } = require('../tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubManifest',
  title: 'GithubManifest',
  pathPrefix: '/github/manifest-json',
}))

t.create('Manifest version')
  .get('/v/RedSparr0w/IndieGala-Helper.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Manifest name')
  .get('/n/RedSparr0w/IndieGala-Helper.json')
  .expectBadge({ label: 'name', message: 'IndieGala Helper' })

t.create('Manifest array')
  .get('/permissions/RedSparr0w/IndieGala-Helper.json')
  .expectBadge({
    label: 'permissions',
    message: Joi.string().regex(/.*?,/),
  })

t.create('Manifest object')
  .get('/background/RedSparr0w/IndieGala-Helper.json')
  .expectBadge({ label: 'manifest', message: 'invalid key value' })

t.create('Manifest invalid json response')
  .get('/v/RedSparr0w/not-a-real-project.json')
  .expectBadge({
    label: 'version',
    message: 'repo not found, branch not found, or manifest.json missing',
  })
