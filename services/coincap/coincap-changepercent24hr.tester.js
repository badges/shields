import { isPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('change percent 24hr').get('/bitcoin.json').expectBadge({
  label: 'Bitcoin',
  message: isPercentage,
})

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'bitcoin',
  message: 'asset not found',
})
