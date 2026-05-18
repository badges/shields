import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'EdgeAddOnsUsers',
  title: 'Microsoft Edge Add-ons Users',
  pathPrefix: '/edge-add-ons',
})

t.create('Downloads (redirect)')
  .get('/d/cnlefmmeadmemmdciolhbnfeacpdfbkd.svg')
  .expectRedirect('/edge-add-ons/users/cnlefmmeadmemmdciolhbnfeacpdfbkd.svg')

t.create('Users')
  .get('/users/cnlefmmeadmemmdciolhbnfeacpdfbkd.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/users/invalid-name-of-addon.json')
  .expectBadge({ label: 'users', message: 'not found' })
