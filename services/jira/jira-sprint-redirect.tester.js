import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JiraSprintRedirect',
  title: 'JiraSprintRedirect',
  pathPrefix: '/jira/sprint',
})

t.create('jira sprint')
  .get('/https/jira.spring.io/94.svg')
  .expectRedirect(
    `/jira/sprint/94.svg?baseUrl=${encodeURIComponent(
      'https://jira.spring.io'
    )}`
  )
