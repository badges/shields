import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last commit (redirect)')
  .get('/guitarix.json')
  .expectRedirect('/sourceforge/last-commit/guitarix/git.json')
