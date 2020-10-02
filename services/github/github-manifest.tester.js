'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubManifest',
  title: 'GithubManifest',
  pathPrefix: '/github/manifest-json',
}))

t.create('Manifest version')
  .get('/v/sindresorhus/show-all-github-issues.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Manifest version (path)')
  .get('/v/RedSparr0w/IndieGala-Helper.json?filename=extension/manifest.json')
  .expectBadge({
    label: 'version',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Manifest version (path not found)')
  .get(
    '/v/RedSparr0w/IndieGala-Helper.json?filename=invalid-directory/manifest.json'
  )
  .expectBadge({
    label: 'version',
    message:
      'repo not found, branch not found, or invalid-directory/manifest.json missing',
  })

t.create('Manifest name (path)')
  .get('/n/RedSparr0w/IndieGala-Helper.json?filename=extension/manifest.json')
  .expectBadge({ label: 'name', message: 'IndieGala Helper' })

t.create('Manifest array (path)')
  .get(
    '/permissions/RedSparr0w/IndieGala-Helper.json?filename=extension/manifest.json'
  )
  .expectBadge({
    label: 'permissions',
    message: Joi.string().regex(/.*?,/),
  })

t.create('Manifest object (path)')
  .get(
    '/background/RedSparr0w/IndieGala-Helper.json?filename=extension/manifest.json'
  )
  .expectBadge({ label: 'manifest', message: 'invalid key value' })

t.create('Manifest invalid json response')
  .get('/v/RedSparr0w/not-a-real-project.json')
  .expectBadge({
    label: 'version',
    message: 'repo not found, branch not found, or manifest.json missing',
  })
