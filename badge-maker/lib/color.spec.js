'use strict'

const { test, given, forCases } = require('sazerac')
const { isHexColor, normalizeColor, toSvgColor } = require('./color')

test(isHexColor, () => {
  forCases([given('f00bae'), given('4c1'), given('ABC123')]).expect(true)
  forCases([
    given('f00bar'),
    given(''),
    given(undefined),
    given(null),
    given(true),
    given([]),
    given({}),
    given(() => {}),
  ]).expect(false)
})

test(normalizeColor, () => {
  given('red').expect('red')
  given('blue').expect('blue')
  given('4c1').expect('#4c1')
  given('f00f00').expect('#f00f00')
  given('ABC123').expect('#abc123')
  given('#ABC123').expect('#abc123')
  given('papayawhip').expect('papayawhip')
  given('purple').expect('purple')
  forCases([
    given(''),
    given('not-a-color'),
    given(undefined),
    given(null),
    given(true),
    given([]),
    given({}),
    given(() => {}),
  ]).expect(undefined)
  given('lightgray').expect('lightgrey')
  given('informational').expect('blue')
})

test(toSvgColor, () => {
  given('red').expect('#e05d44')
  given('blue').expect('#007ec6')
  given('4c1').expect('#4c1')
  given('f00f00').expect('#f00f00')
  given('ABC123').expect('#abc123')
  given('#ABC123').expect('#abc123')
  given('papayawhip').expect('papayawhip')
  given('purple').expect('purple')
  forCases([given(''), given(undefined), given('not-a-color')]).expect(
    undefined
  )
  given('lightgray').expect('#9f9f9f')
  given('informational').expect('#007ec6')
})
