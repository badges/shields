'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const knownValidBook = 'juice-shop'

t.create('known book pages')
  .get(`/pages/${knownValidBook}.json`)
  .expectBadge({
    label: 'pages',
    message: Joi.number(),
  })

t.create('known book sold')
  .get(`/sold/${knownValidBook}.json`)
  .expectBadge({
    label: 'sold',
    message: Joi.number(),
  })

t.create('unknown book')
  .get(`/pages/234uFjAsDf234209.json`)
  .expectBadge({ label: 'leanpub', message: 'book not found' })

t.create('404 book summary error response')
  .get(`/pages/${knownValidBook}.json`)
  .intercept(nock =>
    nock('https://leanpub.com/')
      .get(`/${knownValidBook}.json`)
      .reply(404)
  )
  .expectBadge({
    label: 'leanpub',
    message: 'book not found',
  })

t.create('correct page count')
  .get(`/pages/${knownValidBook}.json`)
  .intercept(nock =>
    nock('https://leanpub.com/')
      .get(`/${knownValidBook}.json`)
      .reply(200, {
        id: 12,
        page_count_published: 190,
        total_copies_sold: 27,
      })
  )
  .expectBadge({
    label: 'pages',
    message: '190',
  })

t.create('correct sold count')
  .get(`/sold/${knownValidBook}.json`)
  .intercept(nock =>
    nock('https://leanpub.com/')
      .get(`/${knownValidBook}.json`)
      .reply(200, {
        id: 7,
        page_count_published: 351,
        total_copies_sold: 82347,
      })
  )
  .expectBadge({
    label: 'sold',
    message: '82347',
  })
