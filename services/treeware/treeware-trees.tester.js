import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('request for existing package')
  .get('/stoplightio/spectral.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('request for existing package (mock)')
  .get('/stoplightio/spectral.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/treeware/trees?ref=65c6e3e942e7464b4591e0c8b70d11d5')
      .reply(200, { total: 50 })
  )
  .expectBadge({
    label: 'trees',
    message: '50',
    color: 'green',
  })

t.create('invalid package')
  .get('/non-existent-user/non-existent-package.json')
  .expectBadge({ label: 'trees', message: '0', color: 'red' })
