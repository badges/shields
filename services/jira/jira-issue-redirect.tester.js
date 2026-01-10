import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JiraIssueRedirect',
  title: 'JiraIssueRedirect',
  pathPrefix: '/jira/issue',
})

t.create('jira issue')
  .get('/https/issues.apache.org/jira/kafka-2896.json')
  .expectBadge({
    label: 'jira',
    message: 'https://github.com/badges/shields/pull/11583',
  })
