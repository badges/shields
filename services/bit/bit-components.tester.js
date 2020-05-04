'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('collection (valid)').get('/ramda/ramda.json').expectBadge({
  label: 'components',
  message: isMetric,
})

t.create('collection (valid)')
  .get('/bit/no-collection-test.json')
  .expectBadge({ label: 'components', message: 'collection not found' })
