import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('request for existing asset')
  .get('/bitcoin.json')
  .intercept(nock =>
    nock('https://api.coincap.io')
      .get('/v2/assets/bitcoin')
      .reply(200, { data: { rank: '1', name: 'Bitcoin' } })
  )
  .expectBadge({
    label: 'Bitcoin',
    message: '1',
    color: 'blue',
  })

t.create('rank')
  .get('/bitcoin.json')
  .expectBadge({
    label: 'Bitcoin',
    message: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(1)
      .required(),
    color: 'blue',
  })

t.create('asset not found').get('/not-a-valid-asset.json').expectBadge({
  label: 'Bitcoin',
  message: 'asset not found',
})
