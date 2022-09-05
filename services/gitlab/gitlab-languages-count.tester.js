import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Languages').get('/gitlab-org/gitlab.json').expectBadge({
  label: 'languages',
  message: isMetric,
  color: 'blue',
})

t.create('Languages (self-managed)')
  .get('/gitlab-cn/gitlab.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    label: 'languages',
    message: isMetric,
    color: 'blue',
  })

t.create('Languages (project not found)')
  .get('/open/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'languages',
    message: 'project not found',
  })
