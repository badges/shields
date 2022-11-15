import { test, given } from 'sazerac'
import PriceUsdService from './coincap-priceusd.service'

describe('PriceUsdFormat', function () {
  test(PriceUsdService.priceFormat, () => {
    given({ price: '332432432' }).expect('332,432,432.00')
    given({ price: '332432432.3432432' }).expect('332,432,432.34')
    given({ price: '3' }).expect('3.00')
    given({ price: '33' }).expect('33.00')
    given({ price: '332' }).expect('332.00')
    given({ price: '3324' }).expect('3,324.00')
    given({ price: '332432' }).expect('332,432.00')
    given({ price: '332432.2' }).expect('332,432.20')
    given({ price: '332432.25' }).expect('332,432.25')
  })
})
