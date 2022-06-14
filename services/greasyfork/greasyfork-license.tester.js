import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GreasyForkLicense',
  title: 'Greasy Fork License',
  pathPrefix: '/greasyfork',
})

t.create('License (valid)').get('/l/407466.json').expectBadge({
  label: 'license',
  message: 'MIT License',
})

t.create('License (not found)')
  .get('/l/000000.json')
  .expectBadge({ label: 'license', message: 'not found' })
