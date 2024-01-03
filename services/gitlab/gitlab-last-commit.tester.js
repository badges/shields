import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last commit (recent)').get('/gitlab-org/gitlab.json').expectBadge({
  label: 'last commit',
  message: isFormattedDate,
})

t.create('last commit (on ref and ancient)')
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee')
  .expectBadge({
    label: 'last commit',
    message: 'march 2021',
  })

t.create('last commit (self-managed)')
  .get('/gitlab-cn/gitlab.json?gitlab_url=https://jihulab.com')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('last commit (project not found)')
  .get('/open/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'last commit',
    message: 'project not found',
  })
