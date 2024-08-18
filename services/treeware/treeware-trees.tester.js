import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'TreewareTrees',
  title: 'TreewareTrees',
  pathPrefix: '/treeware/trees',
})

t.create('request for existing package')
  .get('/stoplightio/spectral.json')
  .expectBadge({
    label: 'trees',
    message: 'no longer available',
  })
