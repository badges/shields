import { ServiceTester } from '../tester.js'
import { isInteger } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'AnsibleGalaxyCollectionDownloads',
  title: 'AnsibleGalaxyCollectionDownloads',
  pathPrefix: '/ansible/collection/d',
})

t.create('collection downloads (valid)')
  .get('/community/general')
  .expectBadge({ label: 'community.general', message: isInteger })

t.create('collection downloads (not found)')
  .get('/not/real')
  .expectBadge({ label: 'not.real', message: 'not found' })
