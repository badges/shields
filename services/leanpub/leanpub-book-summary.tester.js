'use strict'

const Joi = require('joi')
const t = require('../create-service-tester')()
module.exports = t

const knownValidBook = 'juice-shop'

t.create('known book pages')
  .get(`/${knownValidBook}/pages.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pages',
      value: Joi.number(),
    })
  )

t.create('known book sold')
  .get(`/${knownValidBook}/sold.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sold',
      value: Joi.number(),
    })
  )

t.create('unknown book')
  .get(`/234uFjAsDf234209/pages.json`)
  .expectJSON({ name: 'leanpub', value: 'book not found' })

t.create('404 book summary error response')
  .get(`/${knownValidBook}/pages.json`)
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
  .get(`/${knownValidBook}/pages.json`)
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
  .get(`/${knownValidBook}/sold.json`)
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

t.create('correct revenue')
  .get(`/${knownValidBook}/revenue.json`)
  .intercept(nock =>
    nock('https://leanpub.com/')
      .get(`/${knownValidBook}.json`)
      .reply(200, {
        id: 5,
        page_count_published: 87,
        total_copies_sold: 200,
        total_revenue: 579999.21,
      })
  )
  .expectJSON({
    name: 'revenue',
    value: '579999.21',
  })
