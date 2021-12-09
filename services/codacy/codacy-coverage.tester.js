import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// https://app.codacy.com/gh/Seagate/cortx-s3server/dashboard?_ga=2.227678553.575705995.1626641804-993201653.1626641804
// https://github.com/Seagate/cortx-s3server
t.create('Coverage').get('/e02de8d738bb4701b6345624ea2de66c.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('Coverage on branch')
  .get('/e02de8d738bb4701b6345624ea2de66c/main.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage not enabled')
  .get('/0cb32ce695b743d68257021455330c66.json')
  .expectBadge({
    label: 'coverage',
    message: 'not enabled for this project',
  })

t.create('Coverage (project not found)')
  .get('/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.json')
  .expectBadge({
    label: 'coverage',
    message: 'project not found',
  })
