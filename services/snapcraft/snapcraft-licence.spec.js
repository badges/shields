import { test, given } from 'sazerac'
import SnapcraftLicense from './snapcraft-licence.service.js'

describe('SnapcraftLicense', function () {
  const testApiData = {
    snap: {
      license: 'BSD-3-Clause',
    },
  }

  test(SnapcraftLicense.transform, () => {
    given(testApiData).expect('BSD-3-Clause')
  })
})
