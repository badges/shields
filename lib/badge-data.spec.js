'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const {
  prependPrefix,
  makeLabel,
  makeLogo,
  makeBadgeData,
} = require('./badge-data')

describe('Badge data helpers', function() {
  test(prependPrefix, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxu'
    )
    given('foobar', 'data:').expect('data:foobar')
    given(undefined, 'data:').expect(undefined)
  })

  test(makeLabel, () => {
    given('my badge', {}).expect('my badge')
    given('My bAdge', {}).expect('my badge')
    given('my badge', { label: 'no, my badge' }).expect('no, my badge')
    given('my badge', { label: 'no, MY badge' }).expect('no, MY badge')
    given('my badge', { label: false }).expect('false')
    given('my badge', { label: 0 }).expect('0')
    given('my badge', { label: '' }).expect('')
  })

  test(makeLogo, () => {
    forCases([
      given('npm', { logo: 'image/svg+xml;base64,PHN2ZyB4bWxu' }),
      given('npm', { logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu' }),
      given('npm', { logo: 'data:image/svg xml;base64,PHN2ZyB4bWxu' }),
      given('npm', { logo: 'data:image/svg+xml;base64,PHN2ZyB\n4bWxu' }),
    ]).expect('data:image/svg+xml;base64,PHN2ZyB4bWxu')
    forCases([given('npm', { logo: '' }), given(undefined, {})]).expect(
      undefined
    )
    given('npm', {}).assert(
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
      colorA: 'blue',
      colorB: 'f00bae',
    })
  })
})
