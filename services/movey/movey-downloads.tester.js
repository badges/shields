import { isMetricAllowNegative } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total downloads').get('/d/MoveStdlib.json').expectBadge({
  label: 'Movey.Net',
  message: isMetricAllowNegative,
  color: '#a1c93e',
})

t.create('total downloads for version')
  .get('/d/MoveStdlib/1.5.0.json')
  .expectBadge({
    label: 'Movey.Net@1.5.0',
    message: isMetricAllowNegative,
    color: '#a1c93e',
  })

t.create('package not found').get('/d/not-a-real-package.json').expectBadge({
  label: 'Movey.Net',
  message: 'package not found',
})

t.create('version not found').get('/d/MoveStdlib/0.0.0.json').expectBadge({
  label: 'Movey.Net',
  message: 'version not found',
})
