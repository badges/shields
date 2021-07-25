import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Plugin Tested WP Version (Alias)')
  .get('/akismet.svg')
  .expectRedirect('/wordpress/plugin/tested/akismet.svg')
