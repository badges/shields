import { test, given } from 'sazerac'
import { BaseAtnService } from './atn-base.js'

describe('ATN service', function () {
  test(BaseAtnService.prototype.addonUrl, () => {
    given({ addonId: 'unicodify-text-transformer' }).expect(
      'https://addons.thunderbird.net/api/v3/addons/addon/unicodify-text-transformer/',
    )
  })
})
