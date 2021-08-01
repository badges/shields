import { test, given, forCases } from 'sazerac'
import { licenseToColor, renderLicenseBadge } from './licenses.js'

describe('license helpers', function () {
  test(licenseToColor, () => {
    forCases([given('MIT'), given('BSD')]).expect('green')
    forCases([given('MPL-2.0'), given('MPL')]).expect('orange')
    forCases([given('Unlicense'), given('CC0')]).expect('7cd958')
    forCases([given('unknown-license'), given(null)]).expect('lightgrey')

    given(['CC0-1.0', 'MPL-2.0']).expect('7cd958')
    given(['MPL-2.0', 'CC0-1.0']).expect('7cd958')
    given(['MIT', 'MPL-2.0']).expect('green')
    given(['MPL-2.0', 'MIT']).expect('green')
    given(['OFL-1.1', 'MPL-2.0']).expect('orange')
    given(['MPL-2.0', 'OFL-1.1']).expect('orange')
    given(['EPL-1.0', 'EPL-2.0', 'EPL']).expect('orange')
    given(['CC0-1.0', 'MIT', 'MPL-2.0']).expect('7cd958')
    given(['UNKNOWN-1.0', 'MIT']).expect('green')
    given(['UNKNOWN-1.0', 'UNKNOWN-2.0']).expect('lightgrey')
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
      color: 'green',
    })
    given({ license: 'MIT', color: 'pink' }).expect({
      message: 'MIT',
      color: 'pink',
    })
  })
})
