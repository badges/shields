import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()
const isFileSize = /^\d+(\.\d+)?(MiB|KiB)$/;

t.create('Size').get('/nccfelhkfpbnefflolffkclhenplhiab.json').expectBadge({
  label: 'extension size',
  message: isFileSize,
})

t.create('Size (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'extension size', message: 'not found' })
