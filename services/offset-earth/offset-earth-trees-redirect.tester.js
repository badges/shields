import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'OffsetEarthTreesRedirect',
  title: 'Offset Earth (Trees) Redirector',
  pathPrefix: '/offset-earth',
})

t.create('Offset Earth trees alias').get('/trees/ecologi.json').expectBadge({
  label: 'offset-earth',
  message: 'https://github.com/badges/shields/pull/11583',
})
