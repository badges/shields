'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Author',
})
module.exports = t

t.create('Plugin Author')
  .get('/plugin/author/akismet.json')
  .expectBadge({
    label: 'author',
    message: 'Automattic',
    link: ['https://profiles.wordpress.org/automattic'],
  })

t.create('Plugin Author (Not Found)')
  .get('/plugin/author/100.json')
  .expectBadge({
    label: 'author',
    message: 'not found',
  })

t.create('Theme Author')
  .get('/theme/author/twentytwenty.json')
  .expectBadge({
    label: 'author',
    message: 'WordPress.org',
    link: ['https://profiles.wordpress.org/wordpressdotorg'],
  })

t.create('Theme Author (not found)').get('/theme/author/100.json').expectBadge({
  label: 'author',
  message: 'not found',
})
