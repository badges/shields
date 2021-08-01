import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license (valid)').get('/Config-Augeas.json').expectBadge({
  label: 'license',
  message: 'lgpl_2_1',
})

t.create('license (not found)').get('/not-a-package.json').expectBadge({
  label: 'cpan',
  message: 'not found',
})
