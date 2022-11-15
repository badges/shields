import { test, given } from 'sazerac'
import CoincapPriceUsd from './coincap-priceusd.service.js'

describe('PriceUsd Format', function () {
  test(CoincapPriceUsd.priceFormat, () => {
    given('3').expect('$3.00')
    given('33').expect('$33.00')
    given('332').expect('$332.00')
    given('3324').expect('$3,324.00')
    given('332432').expect('$332,432.00')
    given('332432.2').expect('$332,432.20')
    given('332432.25').expect('$332,432.25')
    given('332432432').expect('$332,432,432.00')
    given('332432432.3432432').expect('$332,432,432.34')
  })
})
