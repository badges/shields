import { createServiceTester } from '../tester.js'
import { isIntegerPercentage } from '../test-validators.js'
import { sprintId, sprintQueryString } from './jira-test-helpers.js'
export const t = await createServiceTester()

t.create('unknown sprint')
  .get('/abc.json?baseUrl=https://jira.spring.io')
  .expectBadge({ label: 'jira', message: 'sprint not found' })

t.create('known sprint')
  .get('/94.json?baseUrl=https://jira.spring.io')
  .expectBadge({
    label: 'completion',
    message: isIntegerPercentage,
  })

t.create('100% completion')
  .get(`/${sprintId}.json?baseUrl=http://issues.apache.org/jira`)
  .intercept(nock =>
    nock('http://issues.apache.org/jira/rest/api/2')
      .get('/search')
      .query(sprintQueryString)
      .reply(200, {
        total: 2,
        issues: [
          {
            fields: {
              resolution: {
                name: 'done',
              },
            },
          },
          {
            fields: {
              resolution: {
                name: 'completed',
              },
            },
          },
        ],
      })
  )
  .expectBadge({
    label: 'completion',
    message: '100%',
    color: 'brightgreen',
  })

t.create('0% completion')
  .get(`/${sprintId}.json?baseUrl=http://issues.apache.org/jira`)
  .intercept(nock =>
    nock('http://issues.apache.org/jira/rest/api/2')
      .get('/search')
      .query(sprintQueryString)
      .reply(200, {
        total: 1,
        issues: [
          {
            fields: {
              resolution: {
                name: 'Unresolved',
              },
            },
          },
        ],
      })
  )
  .expectBadge({
    label: 'completion',
    message: '0%',
    color: 'red',
  })

t.create('no issues in sprint')
  .get(`/${sprintId}.json?baseUrl=http://issues.apache.org/jira`)
  .intercept(nock =>
    nock('http://issues.apache.org/jira/rest/api/2')
      .get('/search')
      .query(sprintQueryString)
      .reply(200, {
        total: 0,
        issues: [],
      })
  )
  .expectBadge({
    label: 'completion',
    message: '0%',
    color: 'red',
  })

t.create('issue with null resolution value')
  .get(`/${sprintId}.json?baseUrl=https://jira.spring.io:8080`)
  .intercept(nock =>
    nock('https://jira.spring.io:8080/rest/api/2')
      .get('/search')
      .query(sprintQueryString)
      .reply(200, {
        total: 2,
        issues: [
          {
            fields: {
              resolution: {
                name: 'done',
              },
            },
          },
          {
            fields: {
              resolution: null,
            },
          },
        ],
      })
  )
  .expectBadge({
    label: 'completion',
    message: '50%',
    color: 'orange',
  })
