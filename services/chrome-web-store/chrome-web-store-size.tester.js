import { createServiceTester } from '../tester.js'
import { isIecFileSize } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Size').get('/nccfelhkfpbnefflolffkclhenplhiab.json').expectBadge({
  label: 'extension size',
  message: isIecFileSize,
})

t.create('Size (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'extension size', message: 'not found' })
