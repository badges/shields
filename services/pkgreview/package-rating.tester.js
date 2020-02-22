'use strict'

const { withRegex, isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isRatingWithReviews = withRegex(
  /^(([0-4](.?([0-9]))?)|5)\/5?\s*\([0-9]*\)$/
)

t.create('Stars Badge renders')
  .get('/stars/npm/react.json')
  .expectBadge({ label: 'stars', message: isStarRating })

t.create('Rating Badge renders')
  .get('/rating/npm/react.json')
  .expectBadge({ label: 'rating', message: isRatingWithReviews })

t.create('nonexistent package')
  .get('/rating/npm/ohlolweallknowthispackagewontexist.json')
  .expectBadge({
    label: 'rating',
    message: 'package not found',
    color: 'red',
  })
