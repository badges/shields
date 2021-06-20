import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JiraIssueRedirect',
  title: 'JiraIssueRedirect',
  pathPrefix: '/jira/issue',
})

t.create('jira issue')
  .get('/https/issues.apache.org/jira/kafka-2896.svg')
  .expectRedirect(
    `/jira/issue/kafka-2896.svg?baseUrl=${encodeURIComponent(
      'https://issues.apache.org/jira'
    )}`
  )
