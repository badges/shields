import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Last updated')
  .get('/nccfelhkfpbnefflolffkclhenplhiab.json')
  .expectBadge({
    label: 'last updated',
    message: isFormattedDate,
  })

t.create('Last updated (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({
    label: 'last updated',
    message: 'not found',
  })
