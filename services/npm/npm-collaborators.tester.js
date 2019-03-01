'use strict'

const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets the contributor count')
  .get('/prettier.json')
  .expectBadge({ label: 'npm collaborators', message: nonNegativeInteger })

t.create('gets the contributor count from a custom registry')
  .get('/prettier.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'npm collaborators', message: nonNegativeInteger })

t.create('contributor count for unknown package')
  .get('/npm-registry-does-not-have-this-package.json')
  .expectBadge({
    label: 'npm collaborators',
    message: 'package not found',
  })
