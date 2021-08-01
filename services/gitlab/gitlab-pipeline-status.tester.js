import { isBuildStatus } from '../build-status.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'GitlabPipeline',
  title: 'Gitlab Pipeline',
  pathPrefix: '/gitlab/pipeline',
})

t.create('Pipeline status').get('/gitlab-org/gitlab/v10.7.6.json').expectBadge({
  label: 'build',
  message: isBuildStatus,
})

t.create('Pipeline status (nonexistent branch)')
  .get('/gitlab-org/gitlab/nope-not-a-branch.json')
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
  .get('/this-repo/does-not-exist/master.json')
  .expectBadge({
    label: 'build',
    message: 'inaccessible',
  })

t.create('Pipeline status (custom gitlab URL)')
  .get('/GNOME/pango/master.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('Pipeline no branch redirect')
  .get('/gitlab-org/gitlab.svg')
  .expectRedirect('/gitlab/pipeline/gitlab-org/gitlab/master.svg')
