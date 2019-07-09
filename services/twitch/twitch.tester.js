'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'twitch',
  title: 'Twitch',
}))

t.create('Status')
  .get('/status/andyonthewings.json')
  .expectBadge({
    label: 'twitch',
    message: function(v) {
      return ['live', 'offline'].indexOf(v) >= 0
    },
    link: ['https://www.twitch.tv/andyonthewings'],
  })

t.create('Invalid Username Specified')
  .get('/status/invalidusernamethatshouldnotexist.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: 'invalid user',
  })
