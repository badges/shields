'use strict'

const { test, given } = require('sazerac')
const { AurVersion } = require('./aur.service')

describe('AurVersion', function () {
  test(AurVersion.render, () => {
    given({ version: '1:1.1.42.622-1', outOfDate: 1 }).expect({
      color: 'orange',
      message: 'v1:1.1.42.622-1',
    })

    given({ version: '7', outOfDate: null }).expect({
      color: 'blue',
      message: 'v7',
    })
  })
})
