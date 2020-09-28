'use strict'

const { test, given, forCases } = require('sazerac')
const {
  isHexColor,
  normalizeColor,
  toSvgColor,
  brightness,
} = require('./color')

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
  given('#ccc').expect('#ccc')
  given('#fffe').expect('#fffe')
  given('#fffeffff').expect('#fffeffff')
  given('#ABC123').expect('#abc123')
  given('papayawhip').expect('papayawhip')
  given('purple').expect('purple')
  given('  blue ').expect('  blue ')
  given('rgb(100%, 200%, 222%)').expect('rgb(100%, 200%, 222%)')
  given('rgb(122, 200, 222)').expect('rgb(122, 200, 222)')
  given('rgb(122, 200, 222, 1)').expect('rgb(122, 200, 222, 1)')
  given('rgba(100, 20, 111, 1)').expect('rgba(100, 20, 111, 1)')
  given('hsl(122, 200%, 222%)').expect('hsl(122, 200%, 222%)')
  given('hsla(122, 200%, 222%, 1)').expect('hsla(122, 200%, 222%, 1)')
  forCases([
    given(),
    given(''),
    given('not-a-color'),
    given('#ABCFGH'),
    given('rgb(-100, 20, 111)'),
    given('rgb(100%, 200, 222)'),
    given('rgba(-100, 20, 111, 1.1)'),
    given('hsl(122, 200, 222, 1)'),
    given('hsl(122, 200, 222)'),
    given('hsl(122, 200, 222%)'),
    given(undefined),
    given(null),
    given(true),
    given(1),
    given(Math),
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

test(brightness, () => {
  given('white').expect(1)
  given('black').expect(0)
  given('#abc123').expect(0.66)
  given('rgb(10, 5, 128)').expect(0.08)
  given(undefined).expect(0)
  given('not-a-color').expect(0)
})
