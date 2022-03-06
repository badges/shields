import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('score (valid)').get('/github/org/repo.json').expectBadge({
  label: 'scorecard-score',
  message: '1',
})
