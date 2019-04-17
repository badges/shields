'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CodeclimateCoverageRedirector',
  title: 'Code Climate Coverage Redirector',
  pathPrefix: '/codeclimate',
}))

t.create('Top-level coverage shortcut')
  .get('/jekyll/jekyll.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/codeclimate/coverage/jekyll/jekyll.svg')

t.create('Coverage shortcut')
  .get('/c/jekyll/jekyll.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/codeclimate/coverage/jekyll/jekyll.svg')

t.create('Coverage letter shortcut')
  .get('/c-letter/jekyll/jekyll.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/codeclimate/coverage-letter/jekyll/jekyll.svg')

t.create('Coverage percentage shortcut')
  .get('/coverage-percentage/jekyll/jekyll.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/codeclimate/coverage/jekyll/jekyll.svg')
