'use strict'

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

t.create('Status')
  .skipWhen(checkShouldSkip)
  .get('/status/andyonthewings.json')
  .expectBadge({
    label: 'twitch',
    message: function(v) {
      return ['live', 'offline'].indexOf(v) >= 0
    },
    link: ['https://www.twitch.tv/andyonthewings'],
  })

t.create('Invalid Username Specified')
  .skipWhen(checkShouldSkip)
  .get('/status/invalidusernamethatshouldnotexist.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: 'invalid user',
  })
