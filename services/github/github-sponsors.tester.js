'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'GithubSponsors',
  title: 'Github Sponsors',
  pathPrefix: '/github',
}))

t.create('Sponsors').get('/sponsors/Homebrew.json').expectBadge({
  label: 'sponsors',
  message: isMetric,
})

t.create('Sponsors (user not found)')
  .get('/sponsors/badges-non-exist.json')
  .expectBadge({
    label: 'sponsors',
    message: 'user/org not found',
  })
