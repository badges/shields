'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { noToken } = require('../test-helpers')
const noTwitchToken = noToken(require('./twitch.service'))

const t = (module.exports = new ServiceTester({
  id: 'twitch',
  title: 'Twitch',
}))

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
