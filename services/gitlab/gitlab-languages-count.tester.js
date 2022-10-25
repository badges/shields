import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('language count').get('/gitlab-org/gitlab.json').expectBadge({
  label: 'languages',
  message: isMetric,
  color: 'blue',
})

t.create('language count (self-managed)')
  .get('/gitlab-cn/gitlab.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    label: 'languages',
    message: isMetric,
    color: 'blue',
  })

t.create('language count (project not found)')
  .get('/open/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'languages',
    message: 'project not found',
  })
