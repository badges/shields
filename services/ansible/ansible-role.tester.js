import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleGalaxyRole',
  title: 'AnsibleGalaxyRole',
  pathPrefix: '/ansible/role',
})

t.create('role name')
  .get('/14542.json')
  .expectBadge({ label: 'role', message: 'no longer available' })

t.create('role downloads (deprecated)')
  .get('/d/14542.json')
  .expectBadge({ label: 'role downloads', message: 'no longer available' })

t.create('role downloads (valid)')
  .get('/d/openwisp/openwisp2.json')
  .expectBadge({ label: 'role downloads', message: isMetric })

t.create('role downloads (not found)')
  .get('/d/does-not/exist.json')
  .expectBadge({ label: 'role downloads', message: 'not found' })
