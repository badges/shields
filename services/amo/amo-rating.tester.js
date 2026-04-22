import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Rating')
  .get('/rating/IndieGala-Helper.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d(\.\d)?\/\d$/),
  })

t.create('Stars')
  .get('/stars/IndieGala-Helper.json')
  .expectBadge({ label: 'stars', message: isStarRating })

t.create('Rating (not found)')
  .get('/rating/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })

t.create('Rating (thunderbird)')
  .get('/rating/tbkeys-lite.json?registry=thunderbird')
  .intercept(nock =>
    nock('https://addons.thunderbird.net')
      .get('/api/v5/addons/addon/tbkeys-lite/')
      .reply(200, {
        average_daily_users: 1000,
        current_version: { version: '4.0.0' },
        ratings: { average: 4.5 },
        weekly_downloads: 200,
      }),
  )
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d(\.\d)?\/\d$/),
  })
