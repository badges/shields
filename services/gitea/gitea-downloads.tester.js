import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads (total)')
  .get('/dt/gitea/tea.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (total, no pre-releases)')
  .get('/dt/gitea/tea.json?include_prereleases=false')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (latest release)')
  .get('/dv/gitea/tea/latest.json')
  .expectBadge({ label: 'downloads@latest', message: isMetric })

t.create('Downloads (tag)')
  .get('/dv/gitea/tea/v0.16.0.json')
  .expectBadge({ label: 'downloads@v0.16.0', message: isMetric })

t.create('Downloads (total) (self-managed)')
  .get('/dt/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'downloads', message: '0' })

t.create('Downloads (total, no pre-releases) (self-managed)')
  .get(
    '/dt/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org&include_prereleases=false',
  )
  .expectBadge({ label: 'downloads', message: '0' })

t.create('Downloads (latest release) (self-managed)')
  .get(
    '/dv/CanisHelix/shields-badge-test/latest.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads@latest', message: '0' })

t.create('Downloads (tag) (self-managed)')
  .get(
    '/dv/CanisHelix/shields-badge-test/v4.0.0.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads@v4.0.0', message: '0' })

t.create('Downloads (total, no releases) (self-managed)')
  .get(
    '/dt/CanisHelix/shields-badge-test-empty.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads', message: 'no releases found' })

t.create('Downloads (latest release, no releases) (self-managed)')
  .get(
    '/dv/CanisHelix/shields-badge-test-empty/latest.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads', message: 'no releases found' })

t.create('Downloads (tag, no releases) (self-managed)')
  .get(
    '/dv/CanisHelix/shields-badge-test-empty/v1.0.0.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads', message: 'release not found' })

t.create('Downloads (total, no repo) (self-managed)')
  .get('/dt/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({ label: 'downloads', message: 'user or repo not found' })

t.create('Downloads (latest release, no repo) (self-managed)')
  .get(
    '/dv/CanisHelix/does-not-exist/latest.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads', message: 'no releases found' })

t.create('Downloads (tag, no repo) (self-managed)')
  .get(
    '/dv/CanisHelix/does-not-exist/v1.0.0.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({ label: 'downloads', message: 'release not found' })
