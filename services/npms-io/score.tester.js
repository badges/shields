'use strict'

const { isStarRating, isPercentage, withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('should show rating').get('/rating/vue.json').expectBadge({
  label: 'rating',
  message: isPercentage,
  color: 'brightgreen',
})

t.create('should show rating with scope')
  .get('/rating/@vue/cli.json')
  .expectBadge({
    label: 'rating',
    message: isPercentage,
    color: 'brightgreen',
  })

t.create('should show maintenance').get('/maintenance/vue.json').expectBadge({
  label: 'maintenance',
  message: isPercentage,
  color: 'brightgreen',
})

t.create('should show popularity').get('/popularity/vue.json').expectBadge({
  label: 'popularity',
  message: isPercentage,
  color: 'brightgreen',
})

t.create('should show quality').get('/quality/vue.json').expectBadge({
  label: 'quality',
  message: isPercentage,
  color: 'brightgreen',
})

t.create('should show rating with percentage type')
  .get('/rating/vue.json?msg_type=percentage')
  .expectBadge({
    label: 'rating',
    message: isPercentage,
    color: 'brightgreen',
  })

t.create('should show rating with star type')
  .get('/rating/vue.json?msg_type=star')
  .expectBadge({
    label: 'rating',
    message: isStarRating,
    color: 'brightgreen',
  })

t.create('should show rating with grade type')
  .get('/rating/vue.json?msg_type=grade')
  .expectBadge({
    label: 'rating',
    message: withRegex(/[ABCDE]\+?/),
    color: 'brightgreen',
  })

t.create('unknown package')
  .get('/rating/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'rating',
    message: 'package not found or too new',
    color: 'red',
  })
