import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Forks')
  .get('/gitea/tea.json')
  .expectBadge({
    label: 'forks',
    message: isMetric,
    color: 'blue',
    link: ['https://gitea.com/gitea/tea', 'https://gitea.com/gitea/tea/forks'],
  })

t.create('Forks (self-managed)')
  .get('/Codeberg/forgejo.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'forks',
    message: isMetric,
    color: 'blue',
    link: [
      'https://codeberg.org/Codeberg/forgejo',
      'https://codeberg.org/Codeberg/forgejo/forks',
    ],
  })

t.create('Forks (project not found)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'forks',
    message: 'user or repo not found',
  })
