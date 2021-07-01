'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('License')
  .get('/godot-engine/godot.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create("Component Doesn't Exist")
  .get('/fake-project/fake-component.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'license', message: 'component not found' })
