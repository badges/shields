import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Coverage deprecated (with branch)')
  .get('/gitlab-org/gitlab-runner/master.json')
  .expectBadge({
    label: 'gitlab',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('Coverage deprecated (with branch and job_name)')
  .get('/gitlab-org/gitlab-runner/master.json?job_name=test coverage report')
  .expectBadge({
    label: 'gitlab',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('Coverage deprecated (with branch and gitlab_url)')
  .get(
    '/gitlab-org/gitlab-runner/master.json?gitlab_url=https://gitlab.gnome.org',
  )
  .expectBadge({
    label: 'gitlab',
    message: 'https://github.com/badges/shields/pull/11583',
  })
