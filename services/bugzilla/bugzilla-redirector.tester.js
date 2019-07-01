'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'BugzillaRedirector',
  title: 'Bugzilla Redirector',
  pathPrefix: '/bugzilla',
}))

t.create('Bugzilla Mozilla redirector')
  .get('/996038.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/https/bugzilla.mozilla.org/996038.svg')
