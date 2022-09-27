import { test, given } from 'sazerac'
import GreasyForkRatingCount from './greasyfork-rating.service.js'

describe('GreasyForkRatingCount', function () {
  test(GreasyForkRatingCount.render, () => {
    given({ good: 0, ok: 0, bad: 30 }).expect({
      message: '0 good, 0 ok, 30 bad',
      color: 'red',
    })
    given({ good: 10, ok: 20, bad: 30 }).expect({
      message: '10 good, 20 ok, 30 bad',
      color: 'yellow',
    })
    given({ good: 10, ok: 20, bad: 10 }).expect({
      message: '10 good, 20 ok, 10 bad',
      color: 'yellowgreen',
    })
    given({ good: 20, ok: 10, bad: 0 }).expect({
      message: '20 good, 10 ok, 0 bad',
      color: 'green',
    })
    given({ good: 30, ok: 0, bad: 0 }).expect({
      message: '30 good, 0 ok, 0 bad',
      color: 'brightgreen',
    })
    given({ good: 0, ok: 0, bad: 0 }).expect({
      message: '0 good, 0 ok, 0 bad',
      color: 'lightgrey',
    })
  })
})
