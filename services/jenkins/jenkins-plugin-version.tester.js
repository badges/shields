'use strict'

const Joi = require('@hapi/joi')
const { ServiceTester } = require('../tester')

const t = new ServiceTester({
  id: 'jenkins-plugin',
  title: 'JenkinsPluginVersion',
  pathPrefix: '/jenkins',
})
module.exports = t

t.create('latest version')
  .get('/plugin/v/blueocean.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectBadge({
    label: 'plugin',
    message: Joi.string().regex(/^v(.*)$/),
  })

t.create('version 0')
  .get('/plugin/v/blueocean.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '0' } } })
  )
  .expectBadge({
    label: 'plugin',
    message: Joi.string().regex(/^v0$/),
  })

t.create('inexistent artifact')
  .get('/plugin/v/inexistent-artifact-id.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectBadge({ label: 'plugin', message: 'plugin not found' })
