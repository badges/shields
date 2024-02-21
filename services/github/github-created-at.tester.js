import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('created at').get('/github/firereact.json').expectBadge({
  label: 'created at',
  message: 'not implemented',
})
