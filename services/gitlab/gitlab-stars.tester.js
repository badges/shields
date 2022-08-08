import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Stars')
  .get('/gitlab-org/gitlab.json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    color: 'blue',
    link: [
      'https://gitlab.com/gitlab-org/gitlab',
      'https://gitlab.com/gitlab-org/gitlab/-/starrers',
    ],
  })

t.create('Stars (self-managed)')
  .get('/gitlab-cn/gitlab.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    color: 'blue',
    link: [
      'https://jihulab.com/gitlab-cn/gitlab',
      'https://jihulab.com/gitlab-cn/gitlab/-/starrers',
    ],
  })

t.create('Stars (project not found)')
  .get('/user1/gitlab-does-not-have-this-repo.json')
  .expectBadge({
    label: 'stars',
    message: 'project not found',
  })
