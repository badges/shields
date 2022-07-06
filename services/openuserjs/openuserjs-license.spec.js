import { test, given } from 'sazerac'
import OpenUserJSLicense from './openuserjs-license.service.js'

describe('OpenUserJSLicense', function () {
  const data = {
    UserScript: {},
  }

  const data2 = {
    UserScript: {
      license: [
        {
          value: 'GPL-3.0-or-later',
        },
      ],
    },
  }

  const data3 = {
    UserScript: {
      license: [
        {
          value:
            'CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode',
        },
        {
          value: 'GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt',
        },
      ],
    },
  }

  test(OpenUserJSLicense.transform, () => {
    given(data).expect({
      licenses: ['MIT'],
    })
    given(data2).expect({
      licenses: ['GPL-3.0-or-later'],
    })
    given(data3).expect({
      licenses: ['GPL-3.0-or-later', 'CC-BY-NC-SA-4.0'],
    })
  })
})
