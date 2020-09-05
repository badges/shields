'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Social',
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

t.create('Plugin Contributor')
  .get('/plugin/contributor/akismet/matt.json')
  .expectBadge({
    label: 'contributor',
    message: 'Matt Mullenweg',
    link: ['https://profiles.wordpress.org/matt'],
  })

t.create('Plugin Contributor (Not Found)')
  .get('/plugin/contributor/akismet/notacontributor.json')
  .expectBadge({
    label: 'contributor',
    message: 'Contributor not found in plugin',
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
