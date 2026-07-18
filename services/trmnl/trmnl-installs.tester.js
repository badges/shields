import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Recipe installs').get('/227153.json').expectBadge({
  label: 'installs',
  message: isMetric,
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
    label: 'installs',
    message: 'recipe not found',
  })

t.create('Invalid response')
  .get('/227153.json')
  .intercept(nock =>
    nock('https://trmnl-badges.gohk.xyz')
      .get('/api/stats')
      .query({ recipe: '227153' })
      .reply(200, { stats: { installs: 'many', forks: 1 } }),
  )
  .expectBadge({
    label: 'installs',
    message: 'invalid response data',
  })
