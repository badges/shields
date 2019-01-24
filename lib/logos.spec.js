'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const {
  prependPrefix,
  isDataUrl,
  prepareNamedLogo,
  makeLogo,
} = require('./logos')

describe('Logo helpers', function() {
  test(prependPrefix, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxu'
    )
    given('foobar', 'data:').expect('data:foobar')
    given(undefined, 'data:').expect(undefined)
  })

  test(isDataUrl, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu').expect(true)
    forCases([given('data:foobar'), given('foobar')]).expect(false)
  })

  test(prepareNamedLogo, () => {
    // These two strings are identical except for characters 159-165 which
    // differ.
    given({ name: 'npm' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSIjY2IwMDAwIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTcgN2gyNnYyNmgtN1YxNGgtNnYxOUg3eiIvPjwvc3ZnPgo='
    )
    given({ name: 'npm', color: 'blue' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSIjMDA3ZWM2Ii8+PHBhdGggZmlsbD0iIzAwN2VjNiIgZD0iTTcgN2gyNnYyNmgtN1YxNGgtNnYxOUg3eiIvPjwvc3ZnPgo='
    )

    it('preserves color if light logo on dark background', function() {
      const logo = prepareNamedLogo({ name: 'javascript' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#f7df1e"')
    })
    it('recolors logo if light logo on light background', function() {
      const logo = prepareNamedLogo({ name: 'javascript', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#333"')
    })

    it('preserves color if dark logo on light background', function() {
      const logo = prepareNamedLogo({ name: 'nuget', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#004880"')
    })
    it('recolors logo if dark logo on dark background', function() {
      const logo = prepareNamedLogo({ name: 'nuget' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="whitesmoke"')
    })

    it('preserves color if medium logo on dark background', function() {
      const logo = prepareNamedLogo({ name: 'skype' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#00aff0"')
    })
    it('preserves color if medium logo on light background', function() {
      const logo = prepareNamedLogo({ name: 'skype', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#00aff0"')
    })
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
    given('npm', {}).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSIjY2IwMDAwIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTcgN2gyNnYyNmgtN1YxNGgtNnYxOUg3eiIvPjwvc3ZnPgo='
    )
  })
})
