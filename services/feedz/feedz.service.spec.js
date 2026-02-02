import { test, given } from 'sazerac'
import { FeedzVersionService } from './feedz.service.js'

describe('Feedz service', function () {
  test(FeedzVersionService.prototype.shieldUrl, () => {
    given({
      organization: 'shieldstests',
      repository: 'public',
      packageName: 'Shields.TestPackage',
      variant: 'v',
    }).expect(
      'https://f.feedz.io/shieldstests/public/shield/Shields.TestPackage/stable',
    )
    given({
      organization: 'shieldstests',
      repository: 'public',
      packageName: 'Shields.TestPackage',
      variant: 'vpre',
    }).expect(
      'https://f.feedz.io/shieldstests/public/shield/Shields.TestPackage/latest',
    )
  })
})
