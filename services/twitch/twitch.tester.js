'use strict'

const Joi = require('@hapi/joi')
const runnerConfig = require('config').util.toObject()
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'twitch',
  title: 'Twitch',
}))

function checkShouldSkip() {
  const noToken =
    !runnerConfig.private.twitch_client_id ||
    !runnerConfig.private.twitch_client_secret
  if (noToken) {
    console.warn(
      'No Twitch client credentials configured. Service tests will be skipped. Add credentials in local.yml to run these tests.'
    )
  }
  return noToken
}

// the first request would take longer since we need to wait for a token
t.create('Status of andyonthewings')
  .skipWhen(checkShouldSkip)
  .get('/status/andyonthewings.json')
  .expectBadge({
    label: 'twitch',
    message: Joi.equal('live', 'offline').required(),
    link: ['https://www.twitch.tv/andyonthewings'],
  })

// the second request should take shorter time since we can reuse the previous token
t.create('Status of noopkat')
  .skipWhen(checkShouldSkip)
  .get('/status/noopkat.json')
  .expectBadge({
    label: 'twitch',
    message: Joi.equal('live', 'offline').required(),
    link: ['https://www.twitch.tv/noopkat'],
  })
