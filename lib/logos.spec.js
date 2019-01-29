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
    // NPM uses multiple colors so the color param should be ignored
    const npmLogo =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSIjY2IwMDAwIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTcgN2gyNnYyNmgtN1YxNGgtNnYxOUg3eiIvPjwvc3ZnPgo='
    given({ name: 'npm' }).expect(npmLogo)
    given({ name: 'npm', color: 'blue' }).expect(npmLogo)

    // dependabot only uses one color so the color param should be respected
    given({ name: 'dependabot' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTkuNzAyLjc3OHY0LjY0OWgzLjA2OFY2Ljk4SDEuNTI4djcuMjM0SDB2NC42NDloMS41Mjh2My42MTdoMjAuOTQ0di0zLjYxN0gyNHYtNC42NDloLTEuNTI4VjYuOThoLTguMTc0Vi43Nzh6bS0uNTIzIDExLjg3bDEuMDIgMS4wNDQtMy4wNDQgMy4wOTUtMi4wNS0yLjA1IDEuMDItMS4wNDUgMS4wMyAxLjAzMnptOC42OTcgMGwxLjAxOCAxLjA0NC0zLjA2OCAzLjA5NS0yLjAzNy0yLjA1IDEuMDE5LTEuMDQ1IDEuMDE4IDEuMDMyeiIvPjwvc3ZnPg=='
    )
    given({ name: 'dependabot', color: 'blue' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0iIzAwN2VjNiI+PHBhdGggZD0iTTkuNzAyLjc3OHY0LjY0OWgzLjA2OFY2Ljk4SDEuNTI4djcuMjM0SDB2NC42NDloMS41Mjh2My42MTdoMjAuOTQ0di0zLjYxN0gyNHYtNC42NDloLTEuNTI4VjYuOThoLTguMTc0Vi43Nzh6bS0uNTIzIDExLjg3bDEuMDIgMS4wNDQtMy4wNDQgMy4wOTUtMi4wNS0yLjA1IDEuMDItMS4wNDUgMS4wMyAxLjAzMnptOC42OTcgMGwxLjAxOCAxLjA0NC0zLjA2OCAzLjA5NS0yLjAzNy0yLjA1IDEuMDE5LTEuMDQ1IDEuMDE4IDEuMDMyeiIvPjwvc3ZnPg=='
    )

    it('preserves color if light logo on dark background', function() {
      const logo = prepareNamedLogo({ name: 'javascript' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#F7DF1E"')
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
      expect(decodedLogo).to.contain('fill="#00AFF0"')
    })
    it('preserves color if medium logo on light background', function() {
      const logo = prepareNamedLogo({ name: 'skype', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#00AFF0"')
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
