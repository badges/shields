import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('unknown issue')
  .get('/notArealIssue-000.json?baseUrl=https://issues.apache.org/jira')
  .expectBadge({ label: 'jira', message: 'issue not found' })

t.create('known issue')
  .get('/kafka-2896.json?baseUrl=https://issues.apache.org/jira')
  .expectBadge({ label: 'kafka-2896', message: 'Resolved' })

t.create('no status color')
  .get('/foo-123.json?baseUrl=http://issues.apache.org/jira')
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
  .expectBadge({
    label: 'foo-123',
    message: 'pending',
    color: 'lightgrey',
  })

t.create('green status color')
  .get('/bar-345.json?baseUrl=https://issues.apache.org:8000/jira')
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
  .expectBadge({
    label: 'bar-345',
    message: 'done',
    color: 'green',
  })

t.create('medium-gray status color')
  .get('/abc-123.json?baseUrl=https://issues.apache.org:8080')
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
  .expectBadge({
    label: 'abc-123',
    message: 'under review',
    color: 'lightgrey',
  })

t.create('yellow status color')
  .get('/test-001.json?baseUrl=https://issues.apache.org')
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
  .expectBadge({
    label: 'test-001',
    message: 'in progress',
    color: 'yellow',
  })

t.create('brown status color')
  .get('/zzz-789.json?baseUrl=https://issues.apache.org')
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
  .expectBadge({
    label: 'zzz-789',
    message: 'muddy',
    color: 'orange',
  })

t.create('warm-red status color')
  .get('/fire-321.json?baseUrl=https://issues.apache.org')
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
  .expectBadge({
    label: 'fire-321',
    message: 'heating up',
    color: 'red',
  })

t.create('blue-gray status color')
  .get('/sky-775.json?baseUrl=https://issues.apache.org')
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
  .expectBadge({
    label: 'sky-775',
    message: 'cloudy',
    color: 'blue',
  })
