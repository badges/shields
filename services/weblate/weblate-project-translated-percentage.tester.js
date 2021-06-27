'use strict'

const { ServiceTester } = require('../tester')
const { isPercentage } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'weblate',
  title: 'Weblate',
}))

t.create('License')
  .get('/godot-engine.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translated', message: isPercentage })

t.create('Not Valid')
  .get('/fake-project.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'translated', message: 'not found' })
