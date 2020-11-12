'use strict'

const { test, forCases, given } = require('sazerac')
const OreVersion = require('./ore-version.service')

describe('OreVersion', function () {
  test(OreVersion.prototype.transform, () => {
    forCases([
      given({
        data: { promoted_versions: [{ version: '2.3' }, { version: '4.5' }] },
      }),
    ]).expect({ version: '2.3' })
  })

  test(OreVersion.prototype.transform, () => {
    forCases([
      given({
        data: { promoted_versions: [] },
      }),
    ]).expect({ version: undefined })
  })

  test(OreVersion.render, () => {
    forCases([given({ version: undefined })]).expect({
      message: 'none',
      color: 'inactive',
    })
  })
})
