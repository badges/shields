'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('Extension')
  .get('/Extension/ParserFunctions.json')
  .expectBadge({ label: 'usage', message: isMetric })

t.create('Skins')
  .get('/Skin/Vector.json')
  .expectBadge({ label: 'usage', message: isMetric })
