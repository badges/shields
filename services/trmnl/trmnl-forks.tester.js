import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Recipe forks').get('/227153.json').expectBadge({
  label: 'forks',
  message: isMetric,
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
    label: 'forks',
    message: 'recipe not found',
  })
