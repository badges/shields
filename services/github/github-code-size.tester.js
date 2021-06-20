import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('code size in bytes for all languages')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'code size',
    message: isFileSize,
  })

t.create('code size in bytes for all languages (empty repo)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({
    label: 'code size',
    message: '0 B',
  })

t.create('code size in bytes for all languages (repo not found)')
  .get('/not-a-real-user/not-a-real-repo.json')
  .expectBadge({
    label: 'code size',
    message: 'repo not found',
  })
