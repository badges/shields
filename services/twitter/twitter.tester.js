import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'twitter',
  title: 'Twitter',
})

t.create('Followers')
  .get('/follow/shields_io.json')
  .expectBadge({
    label: 'follow @shields_io',
    message: isMetric,
    link: [
      'https://twitter.com/intent/follow?screen_name=shields_io',
      'https://twitter.com/shields_io/followers',
    ],
  })

t.create('Invalid Username Specified (non-existent user)')
  .get('/follow/invalidusernamethatshouldnotexist.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: 'invalid user',
  })

t.create('Invalid Username Specified (only spaces)')
  .get('/follow/%20%20.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: 'invalid user',
  })

t.create('URL')
  .get('/url.json?url=https://shields.io')
  .expectBadge({
    label: 'tweet',
    message: '',
    link: [
      'https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fshields.io',
      'https://twitter.com/search?q=https%3A%2F%2Fshields.io',
    ],
  })
