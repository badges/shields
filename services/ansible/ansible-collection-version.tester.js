import { ServiceTester } from '../tester.js'
import { isSemver } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'AnsibleGalaxyCollectionVersion',
  title: 'AnsibleGalaxyCollectionVersion',
  pathPrefix: '/ansible/collection/v',
})

t.create('collection version (valid)')
  .get('/community/general')
  .expectBadge({ label: 'community.general', message: isSemver })

t.create('collection version (not found)')
  .get('/not/real')
  .expectBadge({ label: 'not.real', message: 'not found' })
