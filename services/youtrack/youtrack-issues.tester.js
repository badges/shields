import { createServiceTester } from '../tester.js'
import { isMetricAllowNegative } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (IDEA)').get('/IDEA.json?query=%23Unresolved').expectBadge({
  label: 'issues',
  message: isMetricAllowNegative,
})

t.create('Issues (IDEA) (Invalid State)')
  .get('/IDEA.json?query=%23ABCDEFG')
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })

t.create('Issues (DOESNOTEXIST) (Invalid Project)')
  .get('/DOESNOTEXIST.json?query=%23Unresolved')
  .expectBadge({
    label: 'issues',
    message: 'invalid',
  })
