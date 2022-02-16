import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('EssentialsX (hosted resource)')
  .get('/771.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('external resource').get('/9089.json').expectBadge({
  label: 'size',
  message: 'resource hosted externally',
})

t.create('Invalid Resource').get('/1.json').expectBadge({
  label: 'size',
  message: 'not found',
})
