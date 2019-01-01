'use strict'

const t = (module.exports = require('../create-service-tester')())
const { colorScheme } = require('../test-helpers')
const { mockJiraCreds, restore, user, pass } = require('./jira-test-helpers')

t.create('live: unknown issue')
  .get('/https/issues.apache.org/jira/notArealIssue-000.json')
  .expectJSON({ name: 'jira', value: 'issue not found' })

t.create('live: known issue')
  .get('/https/issues.apache.org/jira/kafka-2896.json')
  .expectJSON({ name: 'kafka-2896', value: 'Resolved' })

t.create('no status color')
  .get('/http/issues.apache.org/jira/foo-123.json?style=_shields_test')
  .intercept(nock =>
    nock('http://issues.apache.org/jira/rest/api/2/issue')
      .get(`/${encodeURIComponent('foo-123')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'pending',
          },
        },
      })
  )
  .expectJSON({
    name: 'foo-123',
    value: 'pending',
    colorB: colorScheme.lightgrey,
  })

t.create('green status color')
  .get('/https/issues.apache.org:8000/jira/bar-345.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org:8000/jira/rest/api/2/issue')
      .get(`/${encodeURIComponent('bar-345')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'done',
            statusCategory: {
              colorName: 'green',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'bar-345',
    value: 'done',
    colorB: colorScheme.green,
  })

t.create('medium-gray status color')
  .get('/https/issues.apache.org:8080/abc-123.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org:8080/rest/api/2/issue')
      .get(`/${encodeURIComponent('abc-123')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'under review',
            statusCategory: {
              colorName: 'medium-gray',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'abc-123',
    value: 'under review',
    colorB: colorScheme.lightgrey,
  })

t.create('yellow status color')
  .get('/https/issues.apache.org/test-001.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org/rest/api/2/issue')
      .get(`/${encodeURIComponent('test-001')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'in progress',
            statusCategory: {
              colorName: 'yellow',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'test-001',
    value: 'in progress',
    colorB: colorScheme.yellow,
  })

t.create('brown status color')
  .get('/https/issues.apache.org/zzz-789.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org/rest/api/2/issue')
      .get(`/${encodeURIComponent('zzz-789')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'muddy',
            statusCategory: {
              colorName: 'brown',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'zzz-789',
    value: 'muddy',
    colorB: colorScheme.orange,
  })

t.create('warm-red status color')
  .get('/https/issues.apache.org/fire-321.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org/rest/api/2/issue')
      .get(`/${encodeURIComponent('fire-321')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'heating up',
            statusCategory: {
              colorName: 'warm-red',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'fire-321',
    value: 'heating up',
    colorB: colorScheme.red,
  })

t.create('blue-gray status color')
  .get('/https/issues.apache.org/sky-775.json?style=_shields_test')
  .intercept(nock =>
    nock('https://issues.apache.org/rest/api/2/issue')
      .get(`/${encodeURIComponent('sky-775')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'cloudy',
            statusCategory: {
              colorName: 'blue-gray',
            },
          },
        },
      })
  )
  .expectJSON({
    name: 'sky-775',
    value: 'cloudy',
    colorB: colorScheme.blue,
  })

t.create('with auth')
  .before(mockJiraCreds)
  .get('/https/myprivatejira.com/secure-234.json')
  .intercept(nock =>
    nock('https://myprivatejira.com/rest/api/2/issue')
      .get(`/${encodeURIComponent('secure-234')}`)
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user,
        pass,
      })
      .reply(200, {
        fields: {
          status: {
            name: 'in progress',
          },
        },
      })
  )
  .finally(restore)
  .expectJSON({ name: 'secure-234', value: 'in progress' })
