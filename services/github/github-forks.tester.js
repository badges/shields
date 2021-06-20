import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Forks')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'forks',
    message: isMetric,
    color: 'blue',
    link: [
      'https://github.com/badges/shields/fork',
      'https://github.com/badges/shields/network',
    ],
  })

t.create('Forks (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'forks',
  message: 'repo not found',
})
