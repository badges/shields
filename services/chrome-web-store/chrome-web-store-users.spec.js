import { test, given } from 'sazerac'
import { ChromeWebStoreUsers } from './chrome-web-store-users.service.js'

describe('ChromeWebStoreUsers', function () {
  describe('transform', function () {
    it('strips every thousands separator, not just the first', function () {
      test(ChromeWebStoreUsers.transform, () => {
        given('8,000').expect('8000')
        given('500,000').expect('500000')
        given('3,000,000').expect('3000000')
        given('12,000,000').expect('12000000')
      })
    })
  })
})
