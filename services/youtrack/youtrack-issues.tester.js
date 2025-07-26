import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (DEMO) (Cloud)')
  .get(
    '/DEMO.json?youtrack_url=https://shields.youtrack.cloud&query=manage%20state%3A%20Unresolved',
  )
  .expectBadge({
    label: 'issues',
    message: isMetric,
  })

t.create('Issues (DEMO) (Empty Query) (Cloud)')
  .get('/DEMO.json?youtrack_url=https://shields.youtrack.cloud')
  .expectBadge({
    label: 'issues',
    message: isMetric,
  })

t.create('Issues (DEMO) (Invalid State) (Cloud Hosted)')
  .get(
    '/DEMO.json?youtrack_url=https://shields.youtrack.cloud&query=%23ABCDEFG',
  )
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })

t.create('Issues (DOESNOTEXIST) (Invalid Project) (Cloud Hosted)')
  .get(
    '/DOESNOTEXIST.json?youtrack_url=https://shields.youtrack.cloud&query=state%3A%20Unresolved',
  )
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })
