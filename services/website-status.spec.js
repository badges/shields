'use strict'

const { test, given } = require('sazerac')
const { renderWebsiteStatus } = require('./website-status')

describe('Website status helpers', function () {
  const customOptions = {
    upMessage: 'groovy',
    upColor: 'papayawhip',
    downMessage: 'no good',
    downColor: 'gray',
  }

  test(renderWebsiteStatus, () => {
    given({ isUp: true }).expect({ message: 'up', color: 'brightgreen' })
    given({ isUp: false }).expect({ message: 'down', color: 'red' })
    given({ isUp: true, ...customOptions }).expect({
      message: 'groovy',
      color: 'papayawhip',
    })
    given({ isUp: false, ...customOptions }).expect({
      message: 'no good',
      color: 'gray',
    })
  })
})
