'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const t = new ServiceTester({ id: 'lgtm', title: 'LGTM' })
module.exports = t

// Alerts Badge

t.create('alerts: total alerts for a project')
  .get('/alerts/g/apache/cloudstack.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'lgtm',
      value: Joi.string().regex(/^[0-9kM.]+ alerts?$/),
    })
  )

t.create('alerts: missing project')
  .get('/alerts/g/some-org/this-project-doesnt-exist.json')
  .expectJSON({
    name: 'lgtm',
    value: 'project not found',
  })

t.create('alerts: no alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 0, languages: data.languages })
  )
  .expectJSON({ name: 'lgtm', value: '0 alerts' })

t.create('alerts: single alert')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 1, languages: data.languages })
  )
  .expectJSON({ name: 'lgtm', value: '1 alert' })

t.create('alerts: multiple alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, { alerts: 123, languages: data.languages })
  )
  .expectJSON({ name: 'lgtm', value: '123 alerts' })

t.create('alerts: json missing alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, {})
  )
  .expectJSON({ name: 'lgtm', value: 'invalid response data' })

// Grade Badge

t.create('grade: missing project')
  .get('/grade/java/g/some-org/this-project-doesnt-exist.json')
  .expectJSON({
    name: 'lgtm',
    value: 'project not found',
  })

t.create('grade: json missing languages')
  .get('/grade/java/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, {})
  )
  .expectJSON({ name: 'lgtm', value: 'invalid response data' })

t.create('grade: grade for a project (java)')
  .get('/grade/java/g/apache/cloudstack.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality: java',
      value: Joi.string().regex(/^(?:A\+)|A|B|C|D|E$/),
    })
  )

t.create('grade: grade for missing language')
  .get('/grade/foo/g/apache/cloudstack.json')
  .expectJSON({
    name: 'code quality: foo',
    value: 'no language data',
  })

// Test display of languages

const data = {
  alerts: 0,
  languages: [
    { lang: 'cpp', grade: 'A+' },
    { lang: 'javascript', grade: 'A' },
    { lang: 'java', grade: 'B' },
    { lang: 'python', grade: 'C' },
    { lang: 'csharp', grade: 'D' },
    { lang: 'other', grade: 'E' },
    { lang: 'foo' },
  ],
}

t.create('grade: cpp')
  .get('/grade/cpp/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: c/c++', value: 'A+' })

t.create('grade: javascript')
  .get('/grade/javascript/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: js/ts', value: 'A' })

t.create('grade: java')
  .get('/grade/java/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: java', value: 'B' })

t.create('grade: python')
  .get('/grade/python/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: python', value: 'C' })

t.create('grade: csharp')
  .get('/grade/csharp/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: c#', value: 'D' })

t.create('grade: other')
  .get('/grade/other/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: other', value: 'E' })

t.create('grade: foo (no grade for valid language)')
  .get('/grade/foo/g/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectJSON({ name: 'code quality: foo', value: 'no language data' })
