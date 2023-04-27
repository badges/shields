import { test, given } from 'sazerac'
import HangarLicense from './hangar-license.service.js'

describe('HangarLicense', function () {
  test(HangarLicense.prototype.transform, () => {
    given({
      data: {
        settings: { license: { name: 'MIT', url: 'http://sample.url' } },
      },
    }).expect({ license: 'MIT' })
  })

  test(HangarLicense.prototype.transform, () => {
    given({
      data: {
        settings: { license: { name: null, url: 'http://sample.url' } },
      },
    }).expect({ license: 'custom' })
  })

  test(HangarLicense.prototype.transform, () => {
    given({
      data: {
        settings: { license: { name: null, url: null } },
      },
    }).expect({ license: undefined })
  })
})
