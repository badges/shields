'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Invalid parameters')
  .get('/stackoverflow/r/invalidimage.json')
  .expectBadge({ label: 'stackoverflow', message: 'invalid parameters' })

t.create('Reputation for StackOverflow user 22656')
  .get('/stackoverflow/r/22656.json')
  .expectBadge({
    label: 'stackoverflow reputation',
    message: isMetric,
  })

t.create('Reputation for Tex user 22656').get('/tex/r/226.json').expectBadge({
  label: 'tex reputation',
  message: isMetric,
})
