'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars Badge renders')
  .get('/stars/npm/react.json')
  .expectBadge({ label: 'stars' })

t.create('Rating Badge renders')
  .get('/rating/npm/react.json')
  .expectBadge({ label: 'rating' })

t.create('Badge fails to render (package not found)')
  .get('/rating/npm/icuwowgnbneiugvneiurfgrsfghw.json')
  .expectBadge({
    label: 'rating',
    message: 'package not found',
    color: 'lightgrey',
  })

t.create('Badge fails to render (package not found)')
  .get('/rating/lol/react.json')
  .expectBadge({
    label: 'rating',
    message: 'package not found',
    color: 'lightgrey',
  })

t.create('Badge renders correctly')
  .get('/rating/npm/react.json')
  .intercept(nock =>
    nock('https://pkgreview.dev/api/v1')
      .get('/npm/react/')
      .reply(200, {
        reviewsCount: 3,
        rating: 1,
      })
  )
  .expectBadge({ label: 'rating', message: '5/5 (3)', color: 'brightgreen' })

t.create('Badge renders correctly')
  .get('/stars/npm/react.json')
  .intercept(nock =>
    nock('https://pkgreview.dev/api/v1')
      .get('/npm/react/')
      .reply(200, {
        reviewsCount: 3,
        rating: 1,
      })
  )
  .expectBadge({ label: 'stars', message: '★★★★★', color: 'brightgreen' })

t.create('Badge renders correctly')
  .get('/stars/npm/lol.json')
  .intercept(nock =>
    nock('https://pkgreview.dev/api/v1')
      .get('/npm/lol/')
      .reply(200, {
        reviewsCount: 0,
        rating: null,
      })
  )
  .expectBadge({ label: 'stars', message: '☆☆☆☆☆', color: 'red' })
