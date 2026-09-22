import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isOutageDeckStatus = Joi.string().valid(
  'operational',
  'degraded',
  'partial outage',
  'major outage',
  'maintenance',
  'unknown',
)

const statusCases = [
  ['operational', 'operational', 'brightgreen'],
  ['degraded', 'degraded', 'yellow'],
  ['partial_outage', 'partial outage', 'orange'],
  ['major_outage', 'major outage', 'red'],
  ['maintenance', 'maintenance', 'blue'],
  ['unknown', 'unknown', 'lightgrey'],
]

for (const [status, message, color] of statusCases) {
  const provider = `example-${status}`
  t.create(`OutageDeck ${status} status (mock)`)
    .get(`/${provider}.json`)
    .intercept(nock =>
      nock('https://outagedeck.com')
        .get(`/api/v1/providers/${provider}`)
        .reply(200, {
          meta: { version: 'v1', generatedAt: '2026-08-05T00:00:00Z' },
          data: { currentStatus: { code: status } },
        }),
    )
    .expectBadge({ label: 'status', message, color })
}

t.create('OutageDeck provider status (live)').get('/github.json').expectBadge({
  label: 'status',
  message: isOutageDeckStatus,
})

t.create('OutageDeck provider not found')
  .get('/not-a-provider.json')
  .expectBadge({ label: 'status', message: 'not found' })

t.create('OutageDeck invalid response')
  .get('/invalid-response.json')
  .intercept(nock =>
    nock('https://outagedeck.com')
      .get('/api/v1/providers/invalid-response')
      .reply(200, {
        data: { currentStatus: { code: 'unexpected' } },
      }),
  )
  .expectBadge({ label: 'status', message: 'invalid response data' })
