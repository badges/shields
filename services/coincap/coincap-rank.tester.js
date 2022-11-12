import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('rank').get('/bitcoin.json').expectBadge({
  label: 'Bitcoin',
  message: '1',
  color: 'green',
})

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'bitcoin',
  message: 'asset not found',
})
