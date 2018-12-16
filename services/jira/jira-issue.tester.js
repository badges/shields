'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('live: unknown issue')
  .get('/https/issues.apache.org/jira/notArealIssue-000.json')
  .expectJSON({ name: 'jira', value: 'issue not found' })

t.create('live: known issue')
  .get('/https/issues.apache.org/jira/kafka-2896.json')
  .expectJSON({ name: 'kafka-2896', value: 'Resolved' })

t.create('http endpoint')
  .get('/http/issues.apache.org/jira/foo-123.json')
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
  .expectJSON({ name: 'foo-123', value: 'pending' })

t.create('endpoint with port and path')
  .get('/https/issues.apache.org:8000/jira/bar-345.json')
  .intercept(nock =>
    nock('https://issues.apache.org:8000/jira/rest/api/2/issue')
      .get(`/${encodeURIComponent('bar-345')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'done',
          },
        },
      })
  )
  .expectJSON({ name: 'bar-345', value: 'done' })

t.create('endpoint with port and no path')
  .get('/https/issues.apache.org:8080/abc-123.json')
  .intercept(nock =>
    nock('https://issues.apache.org:8080/rest/api/2/issue')
      .get(`/${encodeURIComponent('abc-123')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'under review',
          },
        },
      })
  )
  .expectJSON({ name: 'abc-123', value: 'under review' })

t.create('endpoint with no port nor path')
  .get('/https/issues.apache.org/test-001.json')
  .intercept(nock =>
    nock('https://issues.apache.org/rest/api/2/issue')
      .get(`/${encodeURIComponent('test-001')}`)
      .reply(200, {
        fields: {
          status: {
            name: 'in progress',
          },
        },
      })
  )
  .expectJSON({ name: 'test-001', value: 'in progress' })
