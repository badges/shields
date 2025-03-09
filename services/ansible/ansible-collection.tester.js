import { ServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'AnsibleGalaxyCollectionName',
  title: 'AnsibleGalaxyCollectionName',
  pathPrefix: '/ansible/collection',
})

export const t2 = new ServiceTester({
  id: 'AnsibleGalaxyCollectionVersion',
  title: 'AnsibleGalaxyCollectionVersion',
  pathPrefix: '/ansible/collection/v',
})

t.create('collection name')
  .get('/278.json')
  .expectBadge({ label: 'collection', message: 'no longer available' })

t2.create('collection version (valid)')
  .get('/community/general')
  .expectBadge({ label: 'community.general', message: isSemver })

t2.create('collection version (not found)')
  .get('/not/real')
  .expectBadge({ label: 'not.real', message: 'not found' })
