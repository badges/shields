import { isCurrency } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('price usd').get('/bitcoin.json').expectBadge({
  label: 'Bitcoin',
  message: isCurrency,
  color: 'green',
})

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'bitcoin',
  message: 'asset not found',
})
