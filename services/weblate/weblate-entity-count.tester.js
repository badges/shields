'use strict'

const { ServiceTester } = require('../tester')
const { withRegex } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'weblate',
  title: 'Weblate',
}))

t.create('Components')
  .get('/components.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: withRegex(/^\d+ components$/) })

t.create('Languages')
  .get('/languages.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: withRegex(/^\d+ languages$/) })

t.create('Projects')
  .get('/projects.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: withRegex(/^\d+ projects$/) })

t.create('Units')
  .timeout(15000)
  .get('/units.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: withRegex(/^\d+ units$/) })

t.create('Users')
  .get('/users.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: withRegex(/^\d+ users$/) })
