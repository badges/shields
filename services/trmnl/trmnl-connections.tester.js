import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Recipe connections')
  .get('/227153.json')
  .expectBadge({
    label: 'connections',
    message: isMetric,
    color: 'blue',
    link: [
      'https://trmnl.com/recipes/227153',
      'https://trmnl.com/recipes/227153',
    ],
  })

t.create('Calculates connections from installs and forks')
  .get('/227153.json')
  .intercept(nock =>
    nock('https://trmnl-badges.gohk.xyz')
      .get('/api/stats')
      .query({ recipe: '227153' })
      .reply(200, { stats: { installs: 6, forks: 188 } }),
  )
  .expectBadge({
    label: 'connections',
    message: '194',
    color: 'blue',
  })

t.create('Recipe not found')
  .get('/0.json')
  .intercept(nock =>
    nock('https://trmnl-badges.gohk.xyz')
      .get('/api/stats')
      .query({ recipe: '0' })
      .reply(404, { error: 'Recipe not found' }),
  )
  .expectBadge({
    label: 'connections',
    message: 'recipe not found',
  })
