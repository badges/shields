import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('License (valid)').get('/406540.json').expectBadge({
  label: 'license',
  message: 'MIT',
})

t.create('License (not found)')
  .get('/000000.json')
  .expectBadge({ label: 'license', message: 'not found' })
