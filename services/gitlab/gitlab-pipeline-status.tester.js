import { isBuildStatus } from '../build-status.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'GitlabPipeline',
  title: 'Gitlab Pipeline',
  pathPrefix: '/gitlab',
})

t.create('Pipeline status')
  .get('/pipeline-status/gitlab-org/gitlab.json?branch=v10.7.6')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline status (nested groups)')
  .get(
    '/pipeline-status/megabyte-labs/dockerfile/ci-pipeline/ansible-lint.json?branch=master'
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline status (nonexistent branch)')
  .get('/pipeline-status/gitlab-org/gitlab.json?branch=nope-not-a-branch')
  .expectBadge({
    label: 'build',
    message: 'branch not found',
  })

// Gitlab will redirect users to a sign-in page
// (which we ultimately see as a 503 error) in the event
// a nonexistent, or private, repository is specified.
// Given the additional complexity that would've been required to
// present users with a more traditional and friendly 'Not Found'
// error message, we will simply display inaccessible
// https://github.com/badges/shields/pull/5538
t.create('Pipeline status (nonexistent repo)')
  .get('/pipeline-status/this-repo/does-not-exist.json?branch=master')
  .expectBadge({
    label: 'build',
    message: 'inaccessible',
  })

t.create('Pipeline status (custom gitlab URL)')
  .get('/pipeline-status/GNOME/pango.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline no branch redirect')
  .get('/pipeline/gitlab-org/gitlab.svg')
  .expectRedirect('/gitlab/pipeline-status/gitlab-org/gitlab.svg?branch=master')

t.create('Pipeline legacy route with branch redirect')
  .get('/pipeline/gitlab-org/gitlab/v10.7.6?style=flat')
  .expectRedirect(
    '/gitlab/pipeline-status/gitlab-org/gitlab.svg?branch=v10.7.6&style=flat'
  )
