import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import { ChromeWebStoreRatingCount } from './chrome-web-store-rating.service.js'

describe('ChromeWebStoreRatingCount', function () {
  describe('transform', function () {
    it('converts Chrome Web Store rating counts to numbers', function () {
      test(ChromeWebStoreRatingCount.transform, () => {
        given('999').expect(999)
        given('3.5').expect(3.5)
        given('3.5K').expect(3500)
        given('3.5k').expect(3500)
      })
    })

    it('throws when the format is unexpected', function () {
      expect(() => ChromeWebStoreRatingCount.transform('2M')).to.throw(
        InvalidResponse,
      )
      expect(() => ChromeWebStoreRatingCount.transform('ratings')).to.throw(
        InvalidResponse,
      )
    })
  })
})
