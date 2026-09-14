import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'BitbucketIssues',
  title: 'Bitbucket Issues',
  pathPrefix: '/bitbucket',
})

t.create('issues-raw (retired badge)')
  .get('/issues-raw/shields-io/test-repo.json')
  .expectBadge({
    label: 'issues',
    message: 'retired badge',
  })

t.create('issues (retired badge)')
  .get('/issues/shields-io/test-repo.json')
  .expectBadge({
    label: 'issues',
    message: 'retired badge',
  })
