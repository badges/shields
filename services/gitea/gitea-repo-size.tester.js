import { createServiceTester } from '../tester.js'
import { isIecFileSize } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Gitea Repository Size').get('/gitea/tea.json').expectBadge({
  label: 'repo size',
  message: isIecFileSize,
})

t.create('Gitea Repository Size (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'repo size',
    message: isIecFileSize,
  })

t.create('Gitea Repository Size (no repo) (self-managed)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'repo size',
    message: 'user or repo not found',
  })
