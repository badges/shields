import { test, given } from 'sazerac'
import { metric } from '../text-formatters.js'
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

  describe('rendered message', function () {
    it('renders counts of a million or more as a compact metric', function () {
      const render = users => metric(ChromeWebStoreUsers.transform(users))
      test(render, () => {
        given('8,000').expect('8k')
        given('500,000').expect('500k')
        given('3,000,000').expect('3M')
        given('12,000,000').expect('12M')
        given('1,234,567').expect('1.2M')
      })
    })
  })
})
