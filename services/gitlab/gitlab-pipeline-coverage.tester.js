import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Coverage (branch)')
  .get('/gitlab-org/gitlab-runner.json?branch=12-0-stable')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (existent branch but coverage not set up)')
  .get('/gitlab-org/gitlab-git-http-server.json?branch=master')
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

t.create('Coverage (nonexistent branch)')
  .get('/gitlab-org/gitlab-runner.json?branch=nope-not-a-branch')
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

// Gitlab will redirect users to a sign-in page
// (which we ultimately see as a 403 error) in the event
// a nonexistent, or private, repository is specified.
// Given the additional complexity that would've been required to
// present users with a more traditional and friendly 'Not Found'
// error message, we will simply display invalid
// https://github.com/badges/shields/pull/5538
// https://github.com/badges/shields/pull/9752
t.create('Coverage (nonexistent repo)')
  .get('/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'coverage',
    message: 'invalid',
  })

t.create('Coverage (custom job)')
  .get(
    '/gitlab-org/gitlab-runner.json?branch=12-0-stable&job_name=test coverage report',
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (custom invalid job)')
  .get(
    '/gitlab-org/gitlab-runner.json?branch=12-0-stable&job_name=i dont exist',
  )
  .expectBadge({
    label: 'coverage',
    message: 'not set up',
  })

t.create('Coverage (custom gitlab URL)')
  .get(
    '/GNOME/at-spi2-core.json?gitlab_url=https://gitlab.gnome.org&branch=master',
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (custom gitlab URL and job)')
  .get(
    '/GNOME/libhandy.json?gitlab_url=https://gitlab.gnome.org&branch=master&job_name=unit-test',
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
