import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { data } from './lgtm-test-helpers.js'
export const t = await createServiceTester()

t.create('alerts: total alerts for a project')
  .get('/github/apache/cloudstack.json')
  .expectBadge({
    label: 'lgtm alerts',
    message: Joi.string().regex(/^[0-9kM.]+$/),
  })

t.create('alerts: missing project')
  .get('/github/some-org/this-project-doesnt-exist.json')
  .expectBadge({
    label: 'lgtm alerts',
    message: 'project not found',
  })

t.create('alerts: no alerts')
  .get('/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 0, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm alerts', message: '0' })

t.create('alerts: single alert')
  .get('/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 1, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm alerts', message: '1' })

t.create('alerts: multiple alerts')
  .get('/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 123, languages: data.languages })
  )
  .expectBadge({ label: 'lgtm alerts', message: '123' })

t.create('alerts: json missing alerts')
  .get('/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, {})
  )
  .expectBadge({ label: 'lgtm alerts', message: 'invalid response data' })

t.create('alerts: total alerts for a project with a github mapped host')
  .get('/github/apache/cloudstack.json')
  .expectBadge({
    label: 'lgtm alerts',
    message: Joi.string().regex(/^[0-9kM.]+$/),
  })

t.create('alerts: total alerts for a project with a bitbucket mapped host')
  .get('/bitbucket/atlassian/confluence-business-blueprints.json')
  .expectBadge({
    label: 'lgtm alerts',
    message: Joi.string().regex(/^[0-9kM.]+$/),
  })
