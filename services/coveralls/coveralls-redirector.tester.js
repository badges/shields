'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CoverallsGitHubRedirect',
  title: 'Coveralls GitHub Redirector',
  pathPrefix: '/coveralls',
}))

t.create('Coveralls VCS type missing')
  .get('/lemurheavy/coveralls-ruby.svg')
  .expectRedirect('/coveralls/github/lemurheavy/coveralls-ruby.svg')
