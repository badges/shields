import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('last commit (recent)').get('/gitlab-org/gitlab.json').expectBadge({
  label: 'last commit',
  message: isFormattedDate,
})

t.create('last commit (on ref) (ancient)')
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee')
  .expectBadge({
    label: 'last commit',
    message: 'march 2021',
  })

t.create('last commit (on ref) (ancient) (by top-level file path)')
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee&path=README.md')
  .expectBadge({
    label: 'last commit',
    message: 'december 2020',
  })

t.create('last commit (on ref) (ancient) (by top-level dir path)')
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee&path=changelogs')
  .expectBadge({
    label: 'last commit',
    message: 'march 2021',
  })

t.create(
  'last commit (on ref) (ancient) (by top-level dir path with trailing slash)',
)
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee&path=changelogs/')
  .expectBadge({
    label: 'last commit',
    message: 'march 2021',
  })

t.create('last commit (on ref) (ancient) (by nested file path)')
  .get('/gitlab-org/gitlab.json?ref=v13.8.6-ee&path=changelogs/README.md')
  .expectBadge({
    label: 'last commit',
    message: 'september 2020',
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

t.create('last commit (no commits found)')
  .get('/gitlab-org/gitlab.json?path=not/a/dir')
  .expectBadge({
    label: 'last commit',
    message: 'no commits found',
  })
