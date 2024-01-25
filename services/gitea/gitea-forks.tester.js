import Joi from 'joi'
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
  .get('/CanisHelix/shields-badge-test.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'forks',
    message: Joi.number().integer(),
    color: 'blue',
    link: [
      'https://codeberg.org/CanisHelix/shields-badge-test',
      'https://codeberg.org/CanisHelix/shields-badge-test/forks',
    ],
  })

t.create('Forks (project not found)')
  .get('/CanisHelix/does-not-exist.json?gitea_url=https://codeberg.org')
  .expectBadge({
    label: 'forks',
    message: 'user or repo not found',
  })
