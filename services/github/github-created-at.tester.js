import { createServiceTester } from '../tester.js'
import { isFormattedDate } from '../test-validators.js'

export const t = await createServiceTester()

t.create('created at').get('/erayerdin/firereact.json').expectBadge({
  label: 'created at',
  message: isFormattedDate,
})
