import { test, given } from 'sazerac'
import { latest, versionColor } from './gem-helpers.js'

describe('Gem helpers', function () {
  test(latest, () => {
    given(['2.0.0', '2.0.0.beta1']).expect('2.0.0')
    given(['2.0.0.beta1', '1.9.0']).expect('2.0.0.beta1')
    given(['0.0.1', '0.0.2']).expect('0.0.2')
  })

  test(versionColor, () => {
    given('1.9.0').expect('blue')
    given('2.0.0.beta1').expect('orange')
    given('0.0.1').expect('orange')
    given('v1').expect('lightgrey')
  })
})
