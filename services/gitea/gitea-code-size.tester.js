import { createServiceTester } from '../tester.js'
import { isIecFileSize } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Code Size').get('/gitea/tea.json').expectBadge({
  label: 'code size',
  message: isIecFileSize,
})

t.create('Code Size (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'code size',
    message: isIecFileSize,
  })

t.create('Code Size (empty repo) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test-empty.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'code size',
    message: '0 B',
  })

t.create('Code Size (no repo) (self-managed)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'code size',
    message: 'user or repo not found',
  })
