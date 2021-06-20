import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'OffsetEarthCarbonRedirect',
  title: 'Offset Earth (Carbon Offset) Redirector',
  pathPrefix: '/offset-earth',
})

t.create('Offset Earth carbon alias')
  .get('/carbon/ecologi.svg')
  .expectRedirect('/ecologi/carbon/ecologi.svg')
