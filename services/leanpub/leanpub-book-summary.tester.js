'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const knownValidBook = 'juice-shop'

t.create('known book pages')
  .get(`/pages/${knownValidBook}.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pages',
      value: Joi.number(),
    })
  )

t.create('known book sold')
  .get(`/sold/${knownValidBook}.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sold',
      value: Joi.number(),
    })
  )

t.create('unknown book')
  .get(`/pages/234uFjAsDf234209.json`)
  .expectJSON({ name: 'leanpub', value: 'book not found' })

t.create('404 book summary error response')
  .get(`/pages/${knownValidBook}.json`)
  .intercept(nock =>
    nock('https://leanpub.com/')
      .get(`/${knownValidBook}.json`)
      .reply(404)
  )
  .expectJSON({
    name: 'leanpub',
    value: 'book not found',
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
  .expectJSON({
    name: 'pages',
    value: '190',
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
  .expectJSON({
    name: 'sold',
    value: '82347',
  })
