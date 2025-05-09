import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import ChromeWebStoreSize from './chrome-web-store-size.service.js'

describe('transform function', function () {
  it('formats size correctly', function () {
    test(ChromeWebStoreSize.transform, () => {
      given('0.55KiB').expect('0.55 KiB')
      given('19.86KiB').expect('19.86 KiB')
      given('432KiB').expect('432 KiB')
    })
  })

  it('throws when the format is unexpected', function () {
    expect(() => ChromeWebStoreSize.transform('432 KiB')).to.throw(
      InvalidResponse,
    )
    expect(() => ChromeWebStoreSize.transform('432')).to.throw(InvalidResponse)
    expect(() => ChromeWebStoreSize.transform('KiB')).to.throw(InvalidResponse)
    expect(() => ChromeWebStoreSize.transform('foobar')).to.throw(
      InvalidResponse,
    )
    expect(() => ChromeWebStoreSize.transform('4.4.4 KiB')).to.throw(
      InvalidResponse,
    )
  })
})
