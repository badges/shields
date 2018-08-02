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
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  // suggest resource requires this header value
  .expectJSON('badges.?', {
    name: 'GitHub issues',
    link: 'https://github.com/atom/atom/issues',
    badge: 'https://img.shields.io/github/issues/atom/atom.svg',
  })
  .expectJSON('badges.?', {
    name: 'GitHub forks',
    link: 'https://github.com/atom/atom/network',
    badge: 'https://img.shields.io/github/forks/atom/atom.svg',
  })
  .expectJSON('badges.?', {
    name: 'GitHub stars',
    link: 'https://github.com/atom/atom/stargazers',
    badge: 'https://img.shields.io/github/stars/atom/atom.svg',
  })
  .expectJSON('badges.?', {
    name: 'Twitter',
    link:
      'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fatom%2Fatom',
    badge:
      'https://img.shields.io/twitter/url/https/github.com/atom/atom.svg?style=social',
  })

t.create('license')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSON('badges.?', {
    name: 'GitHub license',
    link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
    badge: 'https://img.shields.io/github/license/atom/atom.svg',
  })

t.create('license for non-existing project')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(404)
  )
  .expectJSON('badges.?', {
    name: 'GitHub license',
    link: 'https://github.com/atom/atom',
    badge: 'https://img.shields.io/github/license/atom/atom.svg',
  })

t.create('license when json response is invalid')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(invalidJSON)
  )
  .expectJSON('badges.?', {
    name: 'GitHub license',
    link: 'https://github.com/atom/atom',
    badge: 'https://img.shields.io/github/license/atom/atom.svg',
  })

t.create('license when html_url not found in GitHub api response')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .intercept(nock =>
    nock('https://api.github.com')
      .get(/\/repos\/atom\/atom\/license/)
      .reply(200, {
        license: 'MIT',
      })
  )
  .expectJSON('badges.?', {
    name: 'GitHub license',
    link: 'https://github.com/atom/atom',
    badge: 'https://img.shields.io/github/license/atom/atom.svg',
  })
