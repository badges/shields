import { test, given } from 'sazerac'
import OpenVSXRating from './open-vsx-rating.service.js'

describe('OpenVSXRating', function () {
  test(OpenVSXRating.render, () => {
    given({ ratingCount: 0 }).expect({
      message: 'unrated',
      color: 'lightgrey',
    })
  })
})
