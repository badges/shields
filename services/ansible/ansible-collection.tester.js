import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleCollection',
  title: 'AnsibleCollection',
  pathPrefix: '/ansible/collection',
})

t.create('collection name (valid)')
  .get('/278.json')
  .expectBadge({ label: 'collection', message: 'community.general' })

t.create('collection name (not found)')
  .get('/000.json')
  .expectBadge({ label: 'collection', message: 'not found' })
