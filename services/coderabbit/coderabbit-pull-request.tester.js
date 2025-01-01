import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('live CodeRabbitPullRequest')
  .get('/prs/github/coderabbitai/ast-grep-essentials.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: isMetric,
  })

t.create('live CodeRabbitPullRequest nonexistent org')
  .get('/prs/github/not-valid/not-found.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'provider or repo not found',
  })

t.create('live CodeRabbitPullRequest invalid repo')
  .get('/prs/github/coderabbitai/invalid-repo-name.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'provider or repo not found',
  })
