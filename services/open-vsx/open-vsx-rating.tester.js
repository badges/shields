'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex, isStarRating } = require('../test-validators')

const isVscodeRating = withRegex(/[0-5]\.[0-9]{1}\/5?\s*\([0-9]*\)$/)
const isNotFound = withRegex(/^extension not found$/)
const baseUrl = 'https://open-vsx.org/api'

t.create('rating invalid extension')
  .get('/rating/badges/shields.json')
  .expectBadge({
    label: 'rating',
    message: isNotFound,
  })

t.create('rating').get('/rating/redhat/java.json').expectBadge({
  label: 'rating',
  message: isVscodeRating,
})

t.create('zero rating')
  .get('/rating/redhat/java.json')
  .intercept(nock =>
    nock(baseUrl).get(`/redhat/java`).reply(200, {
      version: '0.69.0',
      timestamp: '2020-10-15T13:40:16.986723Z',
      reviewCount: 0,
    })
  )
  .expectBadge({
    label: 'rating',
    message: 'UNRATED',
    color: 'lightgrey',
  })

t.create('stars invalid extension')
  .get('/stars/badges/shields.json')
  .expectBadge({
    label: 'rating',
    message: isNotFound,
  })

t.create('stars live').get('/stars/redhat/java.json').expectBadge({
  label: 'rating',
  message: isStarRating,
})
