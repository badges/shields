'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('Extension')
  .get('/Extension/installs/ParserFunctions.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Skins')
  .get('/Skin/installs/Vector.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Extension Not Exist')
  .get('/Extension/installs/FakeExtensionThatDoesNotExist.json')
  .expectBadge({ label: 'installs', message: 'does not exist' })

t.create('Name Lowercase')
  .get('/Extension/installs/parserfunctions.json')
  .expectBadge({ label: 'installs', message: 'does not exist' })
