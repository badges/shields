'use strict'

const { withRegex, isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isRating = withRegex(/^(([0-4](.?([0-9]))?)|5)\/5$/)

t.create('rating number (user friendly plugin id)')
  .get('/rating/11941-automatic-power-saver.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number (plugin id from plugin.xml)')
  .get('/rating/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number (number as a plugin id)')
  .get('/rating/11941.json')
  .expectBadge({ label: 'rating', message: isRating })

t.create('rating number for unknown plugin (string)')
  .get('/rating/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (numeric)')
  .get('/stars/9999999999999.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (mixed)')
  .get('/stars/9999999999999-abc.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars (user friendly plugin id)')
  .get('/stars/11941-automatic-power-saver.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars (plugin id from plugin.xml)')
  .get('/stars/com.chriscarini.jetbrains.jetbrains-auto-power-saver.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars (number as a plugin id)')
  .get('/stars/11941.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('rating stars for unknown plugin (string)')
  .get('/stars/unknown-plugin.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (numeric)')
  .get('/stars/9999999999999.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating stars for unknown plugin (mixed)')
  .get('/stars/9999999999999-abc.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('rating number')
  .get('/rating/11941.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/11941/rating')
      .reply(200, { meanRating: 4.4848 })
  )
  .expectBadge({ label: 'rating', message: '4.5/5' })

t.create('rating stars')
  .get('/stars/11941.json')
  .intercept(nock =>
    nock('https://plugins.jetbrains.com')
      .get('/api/plugins/11941/rating')
      .reply(200, { meanRating: 4.4848 })
  )
  .expectBadge({ label: 'rating', message: '★★★★½' })
