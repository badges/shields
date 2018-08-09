'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const {
  prependPrefix,
  isHexColor,
  makeLabel,
  makeLogo,
  makeBadgeData,
  makeColor,
  setBadgeColor,
} = require('./badge-data')

describe('Badge data helpers', function() {
  test(prependPrefix, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxu'
    )
    given('foobar', 'data:').expect('data:foobar')
    given(undefined, 'data:').expect(undefined)
  })

  test(isHexColor, () => {
    forCases([given('f00bae'), given('4c1')]).expect(true)
    forCases([given('f00bar'), given(''), given(undefined)]).expect(false)
  })

  test(makeLabel, () => {
    given('my badge', {}).expect('my badge')
    given('my badge', { label: 'no, my badge' }).expect('no, my badge')
    given('my badge', { label: false }).expect('false')
    given('my badge', { label: 0 }).expect('0')
    given('my badge', { label: '' }).expect('')
  })

  test(makeLogo, () => {
    forCases([
      given('gratipay', { logo: 'image/svg+xml;base64,PHN2ZyB4bWxu' }),
      given('gratipay', { logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu' }),
      given('gratipay', { logo: 'data:image/svg xml;base64,PHN2ZyB4bWxu' }),
      given('gratipay', { logo: 'data:image/svg+xml;base64,PHN2ZyB\n4bWxu' }),
    ]).expect('data:image/svg+xml;base64,PHN2ZyB4bWxu')
    forCases([given('gratipay', { logo: '' }), given(undefined, {})]).expect(
      undefined
    )
    given('gratipay', {}).assert(
      'should not be empty',
      v => expect(v).not.to.be.empty
    )
  })

  test(makeBadgeData, () => {
    given('my badge', {
      label: 'no, my badge',
      style: 'flat-square',
      logo: 'image/svg+xml;base64,PHN2ZyB4bWxu',
      logoPosition: 10,
      logoWidth: '25',
      link: 'https://example.com/',
      colorA: 'blue',
      colorB: 'f00bae',
    }).expect({
      text: ['no, my badge', 'n/a'],
      colorscheme: 'lightgrey',
      template: 'flat-square',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      logoPosition: 10,
      logoWidth: 25,
      links: ['https://example.com/'],
      colorA: '#007ec6',
      colorB: '#f00bae',
    })
  })

  test(makeColor, () => {
    given('red').expect('#e05d44')
    given('blue').expect('#007ec6')
    given('4c1').expect('#4c1')
    given('f00f00').expect('#f00f00')
    given('papayawhip').expect('papayawhip')
    given('purple').expect('purple')
  })

  test(setBadgeColor, () => {
    given({}, 'red').expect({ colorscheme: 'red' })
    given({}, 'f00f00').expect({ colorB: '#f00f00' })
    given({ colorB: '#f00f00', colorscheme: 'blue' }, 'red').expect({
      colorscheme: 'red',
    })
    given({ colorB: '#f00f00', colorscheme: 'blue' }, 'blue').expect({
      colorscheme: 'blue',
    })
    given({ colorB: '#f00f00', colorscheme: 'blue' }, 'papayawhip').expect({
      colorB: 'papayawhip',
    })
    given({ colorB: '#f00f00', colorscheme: 'blue' }, 'purple').expect({
      colorB: 'purple',
    })
    given({ colorB: '#b00b00', colorscheme: 'blue' }, '4c1').expect({
      colorB: '#4c1',
    })
    given({ colorB: '#b00b00', colorscheme: 'blue' }, 'f00f00').expect({
      colorB: '#f00f00',
    })
  })
})
