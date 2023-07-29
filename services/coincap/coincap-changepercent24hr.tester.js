import { isPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('request for existing asset with positive')
  .get('/bitcoin.json')
  .intercept(nock =>
    nock('https://api.coincap.io')
      .get('/v2/assets/bitcoin')
      .reply(200, {
        data: { changePercent24Hr: '1.4767080598737783', name: 'Bitcoin' },
      }),
  )
  .expectBadge({
    label: 'bitcoin',
    message: '1.00%',
    color: 'brightgreen',
  })

t.create('request for existing asset with negative')
  .get('/bitcoin.json')
  .intercept(nock =>
    nock('https://api.coincap.io')
      .get('/v2/assets/bitcoin')
      .reply(200, {
        data: { changePercent24Hr: '-1.4767080598737783', name: 'Bitcoin' },
      }),
  )
  .expectBadge({
    label: 'bitcoin',
    message: '-1.00%',
    color: 'red',
  })

t.create('change percent 24hr').get('/bitcoin.json').expectBadge({
  label: 'bitcoin',
  message: isPercentage,
})

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'coincap',
  message: 'asset not found',
})
