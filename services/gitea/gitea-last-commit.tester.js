import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Last Commit (recent)').get('/gitea/tea.json').expectBadge({
  label: 'last commit',
  message: isFormattedDate,
})

t.create('Last Commit (recent) (top-level file path)')
  .get('/gitea/tea.json?path=README.md')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (recent) (top-level dir path)')
  .get('/gitea/tea.json?path=docs')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (recent) (top-level dir path with trailing slash)')
  .get('/gitea/tea.json?path=docs/')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (recent) (nested dir path)')
  .get('/gitea/tea.json?path=docs/CLI.md')
  .expectBadge({
    label: 'last commit',
    message: isFormattedDate,
  })

t.create('Last Commit (recent) (path)')
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

t.create('Last Commit (user not found)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or path not found',
  })

t.create('Last Commit (repo not found)')
  .get('/gitea/not-a-repo.json')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or path not found',
  })

t.create('Last Commit (path not found)')
  .get('/gitea/tea.json?path=not/a/dir')
  .expectBadge({
    label: 'last commit',
    message: 'user, repo or path not found',
  })
