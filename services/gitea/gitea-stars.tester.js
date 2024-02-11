import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Stars')
  .get('/gitea/tea.json')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    color: 'blue',
    link: ['https://gitea.com/gitea/tea', 'https://gitea.com/gitea/tea/stars'],
  })

t.create('Stars (self-managed)')
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'stars',
    message: isMetric,
    color: 'blue',
    link: [
      'https://codeberg.org/CanisHelix/shields-badge-test',
      'https://codeberg.org/CanisHelix/shields-badge-test/stars',
    ],
  })

t.create('Stars (project not found)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'stars',
    message: 'user or repo not found',
  })
