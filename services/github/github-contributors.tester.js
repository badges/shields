'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('Contributors')
  .get('/contributors/cdnjs/cdnjs.json')
  .expectBadge({
    label: 'contributors',
    message: isMetric,
  })

t.create('1 contributor')
  .get('/contributors/paulmelnikow/local-credential-storage.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
  })

t.create('Contributors (repo not found)')
  .get('/contributors/badges/helmets.json')
  .expectBadge({
    label: 'contributors',
    message: 'repo not found',
  })
