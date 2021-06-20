import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'dotnetstatus',
  title: 'dotnet-status',
})

t.create('no longer available (previously get package status)')
  .get('/gh/jaredcnance/dotnet-status/API.json')
  .expectBadge({
    label: 'dotnet status',
    message: 'no longer available',
  })
