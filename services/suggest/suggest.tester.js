'use strict'

// These tests are for the badge-suggestion endpoint in lib/suggest.js. This
// endpoint is called from frontend/components/suggestion-and-search.js.

const ServiceTester = require('../service-tester')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({
  id: 'suggest',
  title: 'suggest',
  pathPrefix: '/$suggest',
})
module.exports = t

t.create('issues, forks, stars and twitter')
  .get(`/v1?url=${encodeURIComponent('https://github.com/atom/atom')}`)
  .expectJSON('suggestions.?', {
    title: 'GitHub issues',
    link: 'https://github.com/atom/atom/issues',
    path: '/github/issues/atom/atom',
  })
  .expectJSON('suggestions.?', {
    title: 'GitHub forks',
    link: 'https://github.com/atom/atom/network',
    path: '/github/forks/atom/atom',
  })
  .expectJSON('suggestions.?', {
    title: 'GitHub stars',
    link: 'https://github.com/atom/atom/stargazers',
    path: '/github/stars/atom/atom',
  })
  .expectJSON('suggestions.?', {
    title: 'Twitter',
    link:
      'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fatom%2Fatom',
    path: '/twitter/url/https/github.com/atom/atom',
    queryParams: {
      style: 'social',
    },
  })

t.create('license')
  .get(`/v1?url=${encodeURIComponent('https://github.com/atom/atom')}`)
  .expectJSON('suggestions.?', {
    title: 'GitHub license',
    link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
    path: '/github/license/atom/atom',
  })

t.create('license for non-existing project')
  .get(`/v1?url=${encodeURIComponent('https://github.com/atom/atom')}`)
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(404)
  )
  .expectJSON('suggestions.?', {
    title: 'GitHub license',
    link: 'https://github.com/atom/atom',
    path: '/github/license/atom/atom',
  })

t.create('license when json response is invalid')
  .get(`/v1?url=${encodeURIComponent('https://github.com/atom/atom')}`)
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(invalidJSON)
  )
  .expectJSON('suggestions.?', {
    title: 'GitHub license',
    link: 'https://github.com/atom/atom',
    path: '/github/license/atom/atom',
  })

t.create('license when html_url not found in GitHub api response')
  .get(`/v1?url=${encodeURIComponent('https://github.com/atom/atom')}`)
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(200, {
        license: 'MIT',
      })
  )
  .expectJSON('suggestions.?', {
    title: 'GitHub license',
    link: 'https://github.com/atom/atom',
    path: '/github/license/atom/atom',
  })
