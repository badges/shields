'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JiraSprintRedirect',
  title: 'JiraSprintRedirect',
  pathPrefix: '/jira/sprint',
}))

t.create('jira sprint')
  .get('/https/jira.spring.io/94.svg')
  .expectRedirect(
    `/jira/sprint/94.svg?baseUrl=${encodeURIComponent(
      'https://jira.spring.io'
    )}`
  )
