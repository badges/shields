'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'version',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'version',
  message: 'not found',
})
