import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'twitter',
  title: 'Twitter',
})

t.create('Followers')
  .get('/follow/shields_io.json')
  .expectBadge({
    label: 'follow @shields_io',
    message: '',
    link: ['https://twitter.com/intent/follow?screen_name=shields_io'],
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
