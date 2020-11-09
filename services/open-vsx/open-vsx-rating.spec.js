'use strict'

const { test, given } = require('sazerac')
const OpenVSXRating = require('./open-vsx-rating.service')

describe('OpenVSXRating', function () {
  test(OpenVSXRating.render, () => {
    given({ ratingCount: 0 }).expect({
      message: 'unrated',
      color: 'lightgrey',
    })
  })
})
