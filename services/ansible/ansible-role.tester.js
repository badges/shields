import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleRole',
  title: 'AnsibleRole',
  pathPrefix: '/ansible/role',
})

t.create('role name (valid)')
  .get('/14542.json')
  .expectBadge({ label: 'role', message: 'openwisp.openwisp2' })

t.create('role name (not found)')
  .get('/000.json')
  .expectBadge({ label: 'role', message: 'not found' })

t.create('role downloads (valid)')
  .get('/d/14542.json')
  .expectBadge({ label: 'role downloads', message: isMetric })

t.create('role downloads (not found)')
  .get('/d/does-not-exist.json')
  .expectBadge({ label: 'role downloads', message: 'not found' })
