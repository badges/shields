'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isIntegerPercentage } = require('../test-validators')
const { sprintId, sprintQueryString } = require('./jira-test-helpers')

t.create('unknown sprint')
  .get('/https/jira.spring.io/abc.json')
  .expectBadge({ label: 'jira', message: 'sprint not found' })

t.create('known sprint')
  .get('/https/jira.spring.io/94.json')
  .expectBadge({
    label: 'completion',
    message: isIntegerPercentage,
  })

t.create('100% completion')
  .get(`/http/issues.apache.org/jira/${sprintId}.json`)
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
  .get(`/http/issues.apache.org/jira/${sprintId}.json`)
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
  .get(`/http/issues.apache.org/jira/${sprintId}.json`)
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
  .get(`/https/jira.spring.io:8080/${sprintId}.json`)
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
