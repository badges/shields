'use strict'

const Joi = require('@hapi/joi')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'discourse',
  title: 'Discourse',
}))

const data = {
  topic_count: 22513,
  post_count: 337719,
  user_count: 31220,
  topics_7_days: 143,
  topics_30_days: 551,
  posts_7_days: 2679,
  posts_30_days: 10445,
  users_7_days: 204,
  users_30_days: 803,
  active_users_7_days: 762,
  active_users_30_days: 1495,
  like_count: 308833,
  likes_7_days: 3633,
  likes_30_days: 13397,
}

t.create('Topics')
  .get('/https/meta.discourse.org/topics.json')
  .intercept(nock =>
    nock('https://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: '23k topics' })

t.create('Posts')
  .get('/https/meta.discourse.org/posts.json')
  .intercept(nock =>
    nock('https://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: '338k posts' })

t.create('Users')
  .get('/https/meta.discourse.org/users.json')
  .intercept(nock =>
    nock('https://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: '31k users' })

t.create('Likes')
  .get('/https/meta.discourse.org/likes.json')
  .intercept(nock =>
    nock('https://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: '309k likes' })

t.create('Status')
  .get('/https/meta.discourse.org/status.json')
  .intercept(nock =>
    nock('https://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: 'online' })

t.create('Status with http (not https)')
  .get('/http/meta.discourse.org/status.json')
  .intercept(nock =>
    nock('http://meta.discourse.org')
      .get('/site/statistics.json')
      .reply(200, data)
  )
  .expectBadge({ label: 'discourse', message: 'online' })

t.create('Status (offline)')
  .get('/https/meta.discourse.org/status.json')
  .networkOff()
  .expectBadge({ label: 'discourse', message: 'inaccessible' })

t.create('Invalid Host')
  .get('/https/some.host/status.json')
  .intercept(nock =>
    nock('https://some.host')
      .get('/site/statistics.json')
      .reply(404, '<h1>Not Found</h1>')
  )
  .expectBadge({ label: 'discourse', message: 'not found' })

t.create('Topics')
  .get('/https/meta.discourse.org/topics.json')
  .expectBadge({
    label: 'discourse',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) topics$/
    ),
  })

t.create('Posts')
  .get('/https/meta.discourse.org/posts.json')
  .expectBadge({
    label: 'discourse',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) posts$/
    ),
  })

t.create('Users')
  .get('/https/meta.discourse.org/users.json')
  .expectBadge({
    label: 'discourse',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) users$/
    ),
  })

t.create('Likes')
  .get('/https/meta.discourse.org/likes.json')
  .expectBadge({
    label: 'discourse',
    message: Joi.string().regex(
      /^([0-9]+[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) likes$/
    ),
  })

t.create('Status')
  .get('/https/meta.discourse.org/status.json')
  .expectBadge({ label: 'discourse', message: 'online' })
