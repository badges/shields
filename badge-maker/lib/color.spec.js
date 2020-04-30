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
  // Shields named color.
  given('red').expect('red')
  given('green').expect('green')
  given('blue').expect('blue')
  given('yellow').expect('yellow')

  // valid hex
  forCases([given('#4c1'), given('#4C1'), given('4C1'), given('4c1')]).expect(
    '#4c1'
  )
  forCases([
    given('#abc123'),
    given('#ABC123'),
    given('abc123'),
    given('ABC123'),
  ]).expect('#abc123')

  // valid rgb(a)
  given('rgb(0,128,255)').expect('rgb(0,128,255)')
  given('rgba(0,128,255,0)').expect('rgba(0,128,255,0)')
  // valid hsl(a)
  given('hsl(100, 56%, 10%)').expect('hsl(100, 56%, 10%)')
  given('hsla(25,20%,0%,0.1)').expect('hsla(25,20%,0%,0.1)')

  // CSS named color.
  given('papayawhip').expect('papayawhip')
  given('purple').expect('purple')

  forCases([
    // invalid hex
    given('#123red'), // contains letter above F
    given('#red'), // contains letter above F
    // invalid rgb(a)
    given('rgb(220,128,255,0.5)'), // has alpha
    given('rgba(0,0,255)'), // no alpha
    // invalid hsl(a)
    given('hsl(360,50%,50%,0.5)'), // has alpha
    given('hsla(0,50%,101%)'), // no alpha
    // neither a css named color nor colorscheme
    given('notacolor'),
    given('bluish'),
    given('almostred'),
    given('brightmaroon'),
    given('cactus'),
    given(''),
    given('not-a-color'),
    given(undefined),
    given(null),
    given(true),
    given([]),
    given({}),
    given(() => {}),
  ]).expect(undefined)

  // Semantic color alias
  given('success').expect('brightgreen')
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
