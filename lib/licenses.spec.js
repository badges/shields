'use strict'

const { test, given, forCases } = require('sazerac')
const { licenseToColor, renderLicenseBadge } = require('./licenses')

describe('license helpers', function() {
  test(licenseToColor, () => {
    given('MIT').expect('green')
    given('MPL-2.0').expect('orange')
    given('Unlicense').expect('7cd958')
    given('unknown-license').expect('lightgrey')
    given(null).expect('lightgrey')
  })

  test(renderLicenseBadge, () => {
    forCases([
      given({ license: undefined }),
      given({ licenses: [] }),
      given({}),
    ]).expect({
      message: 'missing',
      color: 'red',
    })
    forCases([
      given({ license: 'WTFPL' }),
      given({ licenses: ['WTFPL'] }),
    ]).expect({
      message: 'WTFPL',
      color: '7cd958',
    })
    given({ licenses: ['MPL-2.0', 'MIT'] }).expect({
      message: 'MPL-2.0, MIT',
      color: 'lightgrey',
    })
  })
})
