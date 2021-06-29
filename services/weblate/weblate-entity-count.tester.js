'use strict'

const { ServiceTester } = require('../tester')
const { isMetricWithPattern } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'weblate',
  title: 'Weblate',
}))

t.create('Components')
  .get('/components.json?server=https://hosted.weblate.org')
  .expectBadge({
    label: 'weblate',
    message: isMetricWithPattern(/ components/),
  })

t.create('Languages')
  .get('/languages.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ languages/) })

t.create('Projects')
  .get('/projects.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ projects/) })

t.create('Users')
  .get('/users.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ users/) })
