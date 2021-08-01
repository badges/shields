import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'OffsetEarthTreesRedirect',
  title: 'Offset Earth (Trees) Redirector',
  pathPrefix: '/offset-earth',
})

t.create('Offset Earth trees alias')
  .get('/trees/ecologi.svg')
  .expectRedirect('/ecologi/trees/ecologi.svg')
