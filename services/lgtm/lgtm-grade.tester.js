import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { data } from './lgtm-test-helpers.js'
export const t = await createServiceTester()

t.create('grade: missing project')
  .get('/java/github/some-org/this-project-doesnt-exist.json')
  .expectBadge({
    label: 'lgtm',
    message: 'project not found',
  })

t.create('grade: json missing languages')
  .get('/java/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, {})
  )
  .expectBadge({ label: 'lgtm', message: 'invalid response data' })

t.create('grade: grade for a project (java)')
  .get('/java/github/apache/cloudstack.json')
  .expectBadge({
    label: 'code quality: java',
    message: Joi.string().regex(/^(?:A\+)|A|B|C|D|E$/),
  })

t.create('grade: grade for missing language')
  .get('/foo/github/apache/cloudstack.json')
  .expectBadge({
    label: 'code quality: foo',
    message: 'no language data',
  })

t.create('grade: grade for a project with a mapped host')
  .get('/java/github/apache/cloudstack.json')
  .expectBadge({
    label: 'code quality: java',
    message: Joi.string().regex(/^(?:A\+)|A|B|C|D|E$/),
  })

// Test display of languages

t.create('grade: cpp')
  .get('/cpp/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: c/c++', message: 'A+' })

t.create('grade: javascript')
  .get('/javascript/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: js/ts', message: 'A' })

t.create('grade: java')
  .get('/java/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: java', message: 'B' })

t.create('grade: python')
  .get('/python/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: python', message: 'C' })

t.create('grade: csharp')
  .get('/csharp/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: c#', message: 'D' })

t.create('grade: other')
  .get('/other/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: other', message: 'E' })

t.create('grade: foo (no grade for valid language)')
  .get('/foo/github/apache/cloudstack.json')
  .intercept(nock =>
    nock('https://lgtm.com')
      .get('/api/v0.1/project/g/apache/cloudstack/details')
      .reply(200, data)
  )
  .expectBadge({ label: 'code quality: foo', message: 'no language data' })
