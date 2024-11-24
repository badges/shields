import { test, given } from 'sazerac'
import { compareVersion, latest } from './version.js'

describe('Winget Version helpers', function () {
  test(compareVersion, () => {
    // basic compare
    // https://github.com/microsoft/winget-cli/blob/43425fe97d237e03026fca4530dbc422ab445595/src/AppInstallerCLITests/Versions.cpp#L147
    given('1', '2').expect(-1)
    given('1.0.0', '2.0.0').expect(-1)
    given('0.0.1', '0.0.2').expect(-1)
    given('0.0.1-alpha', '0.0.2-alpha').expect(-1)
    given('0.0.1-beta', '0.0.2-alpha').expect(-1)
    given('0.0.1-beta', '0.0.2-alpha').expect(-1)
    given('13.9.8', '14.1').expect(-1)

    given('1.0', '1.0.0').expect(0)

    // Ensure whitespace doesn't affect equality
    given('1.0', '1.0 ').expect(0)
    given('1.0', '1. 0').expect(0)

    // Ensure versions with preambles are sorted correctly
    given('1.0', 'Version 1.0').expect(0)
    given('foo1', 'bar1').expect(0)
    given('v0.0.1', '0.0.2').expect(-1)
    given('v0.0.1', 'v0.0.2').expect(-1)
    given('1.a2', '1.b1').expect(-1)
    given('alpha', 'beta').expect(-1)

    // latest
    // https://github.com/microsoft/winget-cli/blob/43425fe97d237e03026fca4530dbc422ab445595/src/AppInstallerCLITests/Versions.cpp#L217
    given('1.0', 'latest').expect(-1)
    given('100', 'latest').expect(-1)
    given('943849587389754876.1', 'latest').expect(-1)
    given('latest', 'LATEST').expect(0)

    // unknown
    // https://github.com/microsoft/winget-cli/blob/43425fe97d237e03026fca4530dbc422ab445595/src/AppInstallerCLITests/Versions.cpp#L231
    given('unknown', '1.0').expect(-1)
    given('unknown', '1.fork').expect(-1)
    given('unknown', 'UNKNOWN').expect(0)

    // porting failure tests
    // https://github.com/badges/shields/pull/10245#discussion_r1817931237
    // trailing .0 and .0-beta
    given('1.6.0', '1.6.0-beta.98').expect(-1)
  })

  test(latest, () => {
    given(['1.2.3', '1.2.4', '2.0', '1.3.9.1']).expect('2.0')
    given(['1.2.3', '1.2.4', '2.0-beta', '1.3-alpha']).expect('2.0-beta')

    // compareVersion('3.1.1.0', '3.1.1') == 0, so It's free to choose any of them.
    // I don't know why but it looks winget registry uses last newest version.
    given(['3.1.1.0', '3.1.1']).expect('3.1.1')
  })
})
