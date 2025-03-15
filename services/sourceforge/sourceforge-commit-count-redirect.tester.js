import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('commit count (redirect)')
  .get('/guitarix.json')
  .expectRedirect('/sourceforge/commit-count/guitarix/git.json')
