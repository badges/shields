'use strict'

const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('quality score (valid)')
  .get('/432.json')
  .expectBadge({ label: 'quality', message: nonNegativeInteger })

t.create('quality score (not found)')
  .get('/0101.json')
  .expectBadge({ label: 'quality', message: 'no score available' })
