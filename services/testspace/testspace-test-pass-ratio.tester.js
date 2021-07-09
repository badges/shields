import { createServiceTester } from '../tester.js'
import { isIntegerPercentage } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Non-existent or unauthorized org')
  .get('/swellaby1239017823123/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'tests',
    message: 'org not found or not authorized',
  })

t.create('Non-existent project')
  .get('/swellaby/swellaby:nope/main/baz.json')
  .expectBadge({
    label: 'tests',
    message: 'org, project, or space not found',
  })

t.create('Valid project space')
  .get('/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'tests',
    message: isIntegerPercentage,
  })
