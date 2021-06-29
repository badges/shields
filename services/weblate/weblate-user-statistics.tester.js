'use strict'

const { ServiceTester } = require('../tester')
const { isMetricWithPattern } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'weblate',
  title: 'Weblate',
}))

t.create('Translations')
  .get('/user/nijel/translations.json?server=https://hosted.weblate.org')
  .expectBadge({
    label: 'weblate',
    message: isMetricWithPattern(/ translations/),
  })

t.create('Suggestions')
  .get('/user/nijel/suggestions.json?server=https://hosted.weblate.org')
  .expectBadge({
    label: 'weblate',
    message: isMetricWithPattern(/ suggestions/),
  })

t.create('Uploads')
  .get('/user/nijel/uploads.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ uploads/) })

t.create('Comments')
  .get('/user/nijel/comments.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ comments/) })

t.create('Languages')
  .get('/user/nijel/languages.json?server=https://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: isMetricWithPattern(/ languages/) })

t.create('Invalid Protocol')
  .get('/user/nijel/translations.json?server=ftp://hosted.weblate.org')
  .expectBadge({ label: 'weblate', message: 'invalid query parameter: server' })
