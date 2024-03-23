import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Last Commit (recent)').get('/gitea/tea.json').expectBadge({
  label: 'last commit',
  message: isFormattedDate,
})

t.create('Last Commit (recent) {path)')
  .get('/gitea/tea.json?path=README.md')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (recent) (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (on-branch) (self-managed)')
  .get(
    '/CanisHelix/shields-badge-test/scoped.json?gitea_url=https://codeberg.org',
  )
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (project not found)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'last commit',
    message: 'user or repo not found',
  })
