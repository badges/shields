import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('directory file count').get('/badges/shields.json').expectBadge({
  label: 'files',
  message: isMetric,
})

t.create('directory file count (custom path)')
  .get('/badges/shields/services.json')
  .expectBadge({
    label: 'files',
    message: isMetric,
  })

t.create('directory file count (directory not found)')
  .get('/badges/shields/not_existing_directory.json')
  .expectBadge({
    label: 'files',
    message: 'repo or directory not found',
  })

t.create('directory file count (not a directory)')
  .get('/badges/shields/package.json.json')
  .expectBadge({
    label: 'files',
    message: 'not a directory',
  })
