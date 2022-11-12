import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('request for existing asset')
  .get('/bitcoin.json')
  .intercept(nock =>
    nock('https://api.coincap.io')
      .get('/v2/assets/bitcoin')
      .reply(200, { data: { symbol: 'BTC', name: 'Bitcoin' } })
  )
  .expectBadge({
    label: 'Bitcoin',
    message: 'BTC',
    color: 'green',
  })

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'bitcoin',
  message: 'asset not found',
})

t.create('symbol').get('/bitcoin.json').expectBadge({
  label: 'Bitcoin',
  message: 'BTC',
  color: 'green',
})
