import { createServiceTester } from '../tester.js'
import { isDecimalPercentage } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Top language').get('/gitea/tea.json').expectBadge({
  label: 'go',
  message: isDecimalPercentage,
})

t.create('Top language (empty repo) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test-empty.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'language',
    message: 'no languages found',
  })

t.create('Top language (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'html',
    message: isDecimalPercentage,
  })

t.create('Top language (user or repo not found) (self-managed)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'language',
    message: 'user or repo not found',
  })
