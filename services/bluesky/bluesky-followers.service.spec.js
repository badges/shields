import { test, given } from 'sazerac'
import BlueskyFollowers from './bluesky-followers.service.js'

describe('BlueskyFollowers', function () {
  test(BlueskyFollowers.render, () => {
    given({ followers: 9876 }).expect({
      message: '9.9k',
      color: 'blue',
    })
  })

  test(BlueskyFollowers.render, () => {
    given({ followers: 0 }).expect({
      message: '0',
      color: 'blue',
    })
  })

  test(BlueskyFollowers.render, () => {
    given({ followers: 1234567 }).expect({
      message: '1.2M',
      color: 'blue',
    })
  })
})
