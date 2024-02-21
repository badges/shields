import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('created at').get('/erayerdin/firereact.json').expectBadge({
  label: 'created at',
  message: '2024-01-20T00:11:46Z',
})
