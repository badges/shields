import { isCurrency } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('request for existing asset')
  .get('/bitcoin.json')
  .intercept(nock =>
    nock('https://api.coincap.io')
      .get('/v2/assets/bitcoin')
      .reply(200, {
        data: { priceUsd: '16417.7176754790740415', name: 'Bitcoin' },
      })
  )
  .expectBadge({
    label: 'Bitcoin',
    message: '$16,417.72',
    color: 'blue',
  })

t.create('price usd').get('/bitcoin.json').expectBadge({
  label: 'Bitcoin',
  message: isCurrency,
  color: 'blue',
})

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'Bitcoin',
  message: 'asset not found',
})
