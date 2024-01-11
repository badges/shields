import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Release (latest by date)')
  .get('/gitea/tea.json')
  .expectBadge({
    label: 'release',
    message: Joi.string(),
    color: Joi.any().valid(...['orange', 'blue']),
  })

t.create('Release (latest by date) (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by date, order by created_at) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&date_order_by=created_at',
  )
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by date, order by published_at) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&date_order_by=published_at',
  )
  .expectBadge({ label: 'release', message: 'v3.0.0', color: 'blue' })

t.create('Release (latest by semver) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&sort=semver',
  )
  .expectBadge({ label: 'release', message: 'v4.0.0', color: 'blue' })

t.create('Release (latest by semver pre-release) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&sort=semver&include_prereleases',
  )
  .expectBadge({ label: 'release', message: 'v5.0.0-rc1', color: 'orange' })

t.create('Release (project not found) (self-managed)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'release', message: 'user or repo not found' })

t.create('Release (no tags) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test-empty.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'release', message: 'no releases found' })
