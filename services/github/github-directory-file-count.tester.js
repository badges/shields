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

t.create('directory file count (repo not found)')
  .get('/badges/not_existing_repository.json')
  .expectBadge({
    label: 'files',
    message: 'repo not found',
  })

t.create('directory file count (directory not found)')
  .get('/badges/shields/not_existing_directory.json')
  .expectBadge({
    label: 'files',
    message: 'directory not found',
  })

t.create('directory file count (not a directory)')
  .get('/badges/shields/package.json.json')
  .expectBadge({
    label: 'files',
    message: 'not a directory',
  })
