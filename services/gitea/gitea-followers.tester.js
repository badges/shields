import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Followers')
  .get('/gitea.json')
  .expectBadge({
    label: 'followers',
    message: isMetric,
    color: 'blue',
    link: ['https://gitea.com/gitea?tab=followers'],
  })
