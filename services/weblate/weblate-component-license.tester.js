'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'weblate',
  title: 'Weblate',
}))

t.create('License')
  .get('/license/godot-engine/godot.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create("Component Doesn't Exist")
  .get(
    '/license/fake-project/fake-component.json?server=https://hosted.weblate.org'
  )
  .expectBadge({ label: 'license', message: 'not found' })
