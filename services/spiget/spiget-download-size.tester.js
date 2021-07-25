import { isFileSize } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('Pet Master (id 15904)').get('/15904.json').expectBadge({
  lavel: 'size',
  message: 'resource hosted externally',
})

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'size',
  message: 'not found',
})
