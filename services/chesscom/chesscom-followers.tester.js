import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('request for existing player')
  .get('/player.json')
  .intercept(nock =>
    nock('https://api.chess.com')
      .get('/pub/player/alexandresanlim')
      .reply(200, {
        data: { followers: 200 },
      })
  )
  .expectBadge({
    label: 'Follow',
    message: '200',
    color: 'blue',
  })

t.create('player followers').get('/alexandresanlim.json').expectBadge({
  label: 'Followers',
  message: isMetric,
})

t.create('player not found').get('/not-a-valid-user.json').expectBadge({
  label: 'Followers',
  message: 'player not found',
})
