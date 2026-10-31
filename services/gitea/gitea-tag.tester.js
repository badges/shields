import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Tag (latest by date)')
  .get('/gitea/tea.json')
  .expectBadge({
    label: 'tag',
    message: isSemver,
    color: Joi.any().valid('orange', 'blue'),
  })

t.create('Tag (latest by date) (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'tag', message: 'v5.0.0-rc1', color: 'orange' })

t.create('Tag (latest by semver) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&sort=semver',
  )
  .expectBadge({ label: 'tag', message: 'v4.0.0', color: 'blue' })

t.create('Tag (latest by semver pre-release) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&sort=semver&include_prereleases=true',
  )
  .expectBadge({ label: 'tag', message: 'v5.0.0-rc1', color: 'orange' })

t.create('Tag (project not found) (self-managed)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'tag', message: 'user or repo not found' })

t.create('Tag (no tags) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test-empty.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'tag', message: 'no tags found' })
