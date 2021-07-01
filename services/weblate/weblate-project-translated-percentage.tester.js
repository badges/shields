'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const { isPercentage } = require('../test-validators')

t.create('License')
  .get('/godot-engine.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translated', message: isPercentage })

t.create('Not Valid')
  .get('/fake-project.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translated', message: 'project not found' })
