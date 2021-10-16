import { isSemver, withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isGitLabDisplayVersion = withRegex(/^GitLab [1-9][0-9]*.[0-9]*/)

t.create('Release (latest by date)')
  .get('/shields-ops-group/tag-test.json')
  .expectBadge({ label: 'release', message: 'v2.0.0', color: 'blue' })

t.create('Release (nested groups latest by date)')
  .get('/gitlab-org/frontend/eslint-plugin.json')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Release (latest by date, order by created_at)')
  .get('/shields-ops-group/tag-test.json?date_order_by=created_at')
  .expectBadge({ label: 'release', message: 'v2.0.0', color: 'blue' })

t.create('Release (latest by date, order by released_at)')
  .get('/shields-ops-group/tag-test.json?date_order_by=released_at')
  .expectBadge({ label: 'release', message: 'v2.0.0', color: 'blue' })

t.create('Release (project id latest by date)')
  .get('/29538796.json')
  .expectBadge({ label: 'release', message: 'v2.0.0', color: 'blue' })

t.create('Release (latest by semver)')
  .get('/shields-ops-group/tag-test.json?sort=semver')
  .expectBadge({ label: 'release', message: 'v4.0.0', color: 'blue' })

t.create('Release (latest by semver pre-release)')
  .get('/shields-ops-group/tag-test.json?sort=semver&include_prereleases')
  .expectBadge({ label: 'release', message: 'v5.0.0-beta.1', color: 'orange' })

t.create('Release (release display name)')
  .get('/gitlab-org/gitlab.json?display_name=release')
  .expectBadge({ label: 'release', message: isGitLabDisplayVersion })

t.create('Release (custom instance')
  .get('/GNOME/librsvg.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({ label: 'release', message: isSemver, color: 'blue' })

t.create('Release (project not found)')
  .get('/fdroid/nonexistant.json')
  .expectBadge({ label: 'release', message: 'project not found' })

t.create('Release (no tags)')
  .get('/fdroid/fdroiddata.json')
  .expectBadge({ label: 'release', message: 'no releases found' })
