'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())
const { data } = require('./lgtm-test-helpers')

t.create('alerts: total alerts for a project')
  .get('/g/apache/cloudstack.json')
  .expectBadge({
    label: 'lgtm',
    message: Joi.string().regex(/^[0-9kM.]+ alerts?$/),
  })

t.create('alerts: missing project')
  .get('/g/some-org/this-project-doesnt-exist.json')
  .expectBadge({
    label: 'lgtm',
    message: 'project not found',
  })

t.create('alerts: no alerts')
  .get('/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 0, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm', message: '0 alerts' })

t.create('alerts: single alert')
  .get('/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 1, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm', message: '1 alert' })

t.create('alerts: multiple alerts')
  .get('/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 123, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm', message: '123 alerts' })

t.create('alerts: json missing alerts')
  .get('/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, {})
  )
  .expectBadge({ label: 'lgtm', message: 'invalid response data' })

t.create('alerts: total alerts for a project with a github mapped host')
  .get('/github/apache/cloudstack.json')
  .expectBadge({
    label: 'lgtm',
    message: Joi.string().regex(/^[0-9kM.]+ alerts?$/),
  })

t.create('alerts: total alerts for a project with a bitbucket mapped host')
  .get('/bitbucket/atlassian/confluence-business-blueprints.json')
  .expectBadge({
    label: 'lgtm',
    message: Joi.string().regex(/^[0-9kM.]+ alerts?$/),
  })
