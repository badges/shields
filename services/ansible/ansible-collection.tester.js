import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleCollection',
  title: 'AnsibleCollection',
  pathPrefix: '/ansible/collection',
})

t.create('role name (valid)')
  .get('/278.json')
  .expectBadge({ label: 'role', message: 'community.general' })

t.create('role name (not found)')
  .get('/000.json')
  .expectBadge({ label: 'role', message: 'not found' })
