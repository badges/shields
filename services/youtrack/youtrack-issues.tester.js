import { createServiceTester } from '../tester.js'
import { isMetricAllowNegative } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (DEMO) (Cloud)')
  .get('/DEMO.json?youtrack_url=https://shields.youtrack.cloud&query=%23Fixed')
  .expectBadge({
    label: 'issues',
    message: isMetricAllowNegative,
  })

t.create('Issues (DEMO) (Empty Query) (Cloud)')
  .get('/DEMO.json?youtrack_url=https://shields.youtrack.cloud')
  .expectBadge({
    label: 'issues',
    message: isMetricAllowNegative,
  })

t.create('Issues (DEMO) (Invalid State) (Cloud Hosted)')
  .get('/DEMO.json?https://shields.youtrack.cloud&query=%23ABCDEFG')
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })

t.create('Issues (DOESNOTEXIST) (Invalid Project) (Cloud Hosted)')
  .get('/DOESNOTEXIST.json?https://shields.youtrack.cloud&query=%23Unresolved')
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })
