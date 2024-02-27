import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('created at').get('/erayerdin/firereact.json').expectBadge({
  label: 'created at',
  message: isFormattedDate,
})

t.create('created at').get('/erayerdin/not-a-valid-repo.json').expectBadge({
  label: 'created at',
  message: 'repo not found',
})
