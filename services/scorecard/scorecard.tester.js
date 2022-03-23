import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('score (valid)')
  .get('/github.com/rohankh532/org-workflow-add.json')
  .expectBadge({
    label: 'scorecard score',
    message: '4.2',
    color: 'orange',
  })
