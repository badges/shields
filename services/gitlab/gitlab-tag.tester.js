import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Tag (latest by date)')
  .get('/shields-ops-group/tag-test.json')
  .expectBadge({ label: 'tag', message: 'v2.0.0', color: 'blue' })

t.create('Tag (nested groups)')
  .get('/megabyte-labs/docker/ci-pipeline/ansible-lint.json')
  .expectBadge({ label: 'tag', message: isSemver, color: 'blue' })

t.create('Tag (project id latest by date)')
  .get('/29538796.json')
  .expectBadge({ label: 'tag', message: 'v2.0.0', color: 'blue' })

t.create('Tag (latest by SemVer)')
  .get('/shields-ops-group/tag-test.json?sort=semver')
  .expectBadge({ label: 'tag', message: 'v4.0.0', color: 'blue' })

t.create('Tag (latest by SemVer pre-release)')
  .get('/shields-ops-group/tag-test.json?sort=semver&include_prereleases')
  .expectBadge({ label: 'tag', message: 'v5.0.0-beta.1', color: 'orange' })

t.create('Tag (custom instance)')
  .get('/GNOME/librsvg.json?gitlab_url=https://gitlab.gnome.org')
  .expectBadge({ label: 'tag', message: isSemver, color: 'blue' })

t.create('Tag (repo not found)')
  .get('/fdroid/nonexistant.json')
  .expectBadge({ label: 'tag', message: 'repo not found' })

t.create('Tag (no tags)')
  .get('/fdroid/fdroiddata.json')
  .expectBadge({ label: 'tag', message: 'no tags found' })
