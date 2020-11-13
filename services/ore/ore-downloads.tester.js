'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
