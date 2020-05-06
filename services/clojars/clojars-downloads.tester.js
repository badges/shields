'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('clojars downloads (valid)').get('/prismic.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('clojars downloads (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
