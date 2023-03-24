import { createServiceTester } from '../tester.js'
import { isFileSize } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Download Size')
  .get('/jmp/MiniMOTD/.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('Download Size (not found)')
  .get('/kennytv/kennytv-is-a-unpaid-mojang-intern.json')
  .expectBadge({ label: 'size', message: 'not found', color: 'red' })
