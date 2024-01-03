import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'AnsibleGalaxyCollectionName',
  title: 'AnsibleGalaxyCollectionName',
  pathPrefix: '/ansible/collection',
})

t.create('collection name')
  .get('/278.json')
  .expectBadge({ label: 'collection', message: 'no longer available' })
