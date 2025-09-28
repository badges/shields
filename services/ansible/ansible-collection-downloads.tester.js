import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'AnsibleGalaxyCollectionDownloads',
  title: 'AnsibleGalaxyCollectionDownloads',
  pathPrefix: '/ansible/collection/d',
})

t.create('collection downloads (valid)')
  .get('/community/general.json')
  .expectBadge({ label: 'collection downloads', message: isMetric })

t.create('collection downloads (not found)')
  .get('/not/real.json')
  .expectBadge({ label: 'collection downloads', message: 'not found' })
