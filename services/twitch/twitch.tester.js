import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import _noTwitchToken from './twitch.service.js'
const noTwitchToken = noToken(_noTwitchToken)

export const t = new ServiceTester({
  id: 'twitch',
  title: 'Twitch',
})

// the first request would take longer since we need to wait for a token
t.create('Status of andyonthewings')
  .skipWhen(noTwitchToken)
  .get('/status/andyonthewings.json')
  .expectBadge({
    label: 'twitch',
    message: Joi.equal('live', 'offline').required(),
    link: ['https://www.twitch.tv/andyonthewings'],
  })

// the second request should take shorter time since we can reuse the previous token
t.create('Status of noopkat')
  .skipWhen(noTwitchToken)
  .get('/status/noopkat.json')
  .expectBadge({
    label: 'twitch',
    message: Joi.equal('live', 'offline').required(),
    link: ['https://www.twitch.tv/noopkat'],
  })
