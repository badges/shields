'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'DiscourseRedirect',
  title: 'DiscourseRedirect',
  pathPrefix: '/discourse',
}))

t.create('discourse status')
  .get('/https/meta.discourse.org/status.svg', {
    followRedirect: false,
  })
  .expectRedirect(
    `/discourse/status.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse topics')
  .get('/https/meta.discourse.org/topics.svg', {
    followRedirect: false,
  })
  .expectRedirect(
    `/discourse/topics.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse users')
  .get('/https/meta.discourse.org/users.svg', {
    followRedirect: false,
  })
  .expectRedirect(
    `/discourse/users.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse likes')
  .get('/https/meta.discourse.org/likes.svg', {
    followRedirect: false,
  })
  .expectRedirect(
    `/discourse/likes.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse posts')
  .get('/https/meta.discourse.org/posts.svg', {
    followRedirect: false,
  })
  .expectRedirect(
    `/discourse/posts.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )
