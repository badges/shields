import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Coverage').get('/59d607d0e311408885e418004068ea58.json').expectBadge({
  label: 'coverage',
  message: isIntegerPercentage,
})

t.create('Coverage on branch')
  .get('/59d607d0e311408885e418004068ea58/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage not enabled')
  .get('/e27821fb6289410b8f58338c7e0bc686.json')
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
