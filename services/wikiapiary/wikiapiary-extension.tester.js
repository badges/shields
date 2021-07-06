'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('Extension')
  .get('/extension/installs/ParserFunctions.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Skins')
  .get('/skin/installs/Vector.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Extension Not Found')
  .get('/extension/installs/FakeExtensionThatDoesNotExist.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Name Lowercase')
  .get('/extension/installs/parserfunctions.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Name Title Case')
  .get('/extension/installs/parserFunctions.json')
  .expectBadge({ label: 'installs', message: isMetric })
