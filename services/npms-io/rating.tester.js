'use strict'

const { isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('should show rating').get('/final/vue.json').expectBadge({
  label: 'rating',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('should show rating with scope')
  .get('/final/@vue/cli.json')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
    color: 'brightgreen',
  })

t.create('should show maintenance').get('/maintenance/vue.json').expectBadge({
  label: 'maintenance',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('should show popularity').get('/popularity/vue.json').expectBadge({
  label: 'popularity',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('should show quality').get('/quality/vue.json').expectBadge({
  label: 'quality',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('unknown package')
  .get('/final/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'rating',
    message: 'package not found or too new',
    color: 'red',
  })
