'use strict'

const { isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('score of vue').get('/rating/vue.json').expectBadge({
  label: 'Rating',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('score of @vue/cli').get('/rating/@vue/cli.json').expectBadge({
  label: 'Rating',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('maintenance of vue').get('/rating/maintenance/vue.json').expectBadge({
  label: 'Maintenance',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('popularity of vue').get('/rating/popularity/vue.json').expectBadge({
  label: 'Popularity',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('quality of vue').get('/rating/quality/vue.json').expectBadge({
  label: 'Quality',
  message: isStarRating,
  color: 'brightgreen',
})

t.create('unknown package')
  .get('/rating/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'Rating',
    message: 'package not found or too new',
    color: 'red',
  })
