import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Forks')
  .get('/gitlab-org/gitlab.json')
  .expectBadge({
    label: 'forks',
    message: isMetric,
    color: 'blue',
    link: ['https://gitlab.com/gitlab-org/gitlab/-/forks/new'],
  })

t.create('Forks (project not found)')
  .get('/user1/gitlab-does-not-have-this-repo.json')
  .expectBadge({
    label: 'forks',
    message: 'project not found',
  })
