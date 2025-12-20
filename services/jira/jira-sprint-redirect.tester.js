import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JiraSprintRedirect',
  title: 'JiraSprintRedirect',
  pathPrefix: '/jira/sprint',
})

t.create('jira sprint').get('/https/jira.spring.io/94.json').expectBadge({
  label: 'jira',
  message: 'https://github.com/badges/shields/pull/11583',
})
