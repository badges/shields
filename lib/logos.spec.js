import { expect } from 'chai'
import { test, given, forCases } from 'sazerac'
import {
  prependPrefix,
  isDataUrl,
  prepareNamedLogo,
  getSimpleIcon,
  makeLogo,
} from './logos.js'

describe('Logo helpers', function () {
  test(prependPrefix, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxu'
    )
    given('foobar', 'data:').expect('data:foobar')
    given(undefined, 'data:').expect(undefined)
  })

  test(isDataUrl, () => {
    // valid input
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu').expect(true)

    // invalid inputs
    forCases([given('data:foobar'), given('foobar')]).expect(false)

    // attempted XSS attack
    given(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="/><script>alert()</script>'
    ).expect(false)
  })

  test(prepareNamedLogo, () => {
    // NPM uses multiple colors so the color param should be ignored
    const npmLogo =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSIjY2IwMDAwIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTcgN2gyNnYyNmgtN1YxNGgtNnYxOUg3eiIvPjwvc3ZnPgo='
    given({ name: 'npm' }).expect(npmLogo)
    given({ name: 'npm', color: 'blue' }).expect(npmLogo)

    // dependabot only uses one color so the color param should be respected
    given({ name: 'dependabot' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NCA1NCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTI1IDNhMSAxIDAgMCAwLTEgMXY3YTEgMSAwIDAgMCAxIDFoNXYzSDZhMyAzIDAgMCAwLTMgM3YxMkgxYTEgMSAwIDAgMC0xIDF2MTBhMSAxIDAgMCAwIDEgMWgydjZhMyAzIDAgMCAwIDMgM2g0MmEzIDMgMCAwIDAgMy0zdi02aDJhMSAxIDAgMCAwIDEtMVYzMWExIDEgMCAwIDAtMS0xaC0yVjE4YTMgMyAwIDAgMC0zLTNIMzNWNGExIDEgMCAwIDAtMS0xaC03em0tMy45ODIgMjZhMS4yMSAxLjIxIDAgMCAxIC44MzcuMzU1bDEuMjkgMS4yOWExLjIxIDEuMjEgMCAwIDEgMCAxLjcwOSAxLjIxIDEuMjEgMCAwIDEgMCAuMDAxbC02LjI5MSA2LjI5YTEuMjEgMS4yMSAwIDAgMS0xLjcxIDBsLTMuNzktMy43OTFhMS4yMSAxLjIxIDAgMCAxIDAtMS43MWwxLjI5LTEuMjlhMS4yMSAxLjIxIDAgMCAxIDEuNzEgMEwxNiAzMy41bDQuMTQ1LTQuMTQ1YTEuMjEgMS4yMSAwIDAgMSAuODczLS4zNTV6bTE5Ljk2MiAwYTEuMjEgMS4yMSAwIDAgMSAuODc0LjM1NGwxLjI5IDEuMjlhMS4yMSAxLjIxIDAgMCAxIDAgMS43MWwtNi4yOSA2LjI4OXYuMDAyYTEuMjEgMS4yMSAwIDAgMS0xLjcxMSAwbC0zLjc5LTMuNzlhMS4yMSAxLjIxIDAgMCAxIDAtMS43MWwxLjI5LTEuMjlhMS4yMSAxLjIxIDAgMCAxIDEuNzEgMGwxLjY0NSAxLjY0NSA0LjE0Ny00LjE0NkExLjIxIDEuMjEgMCAwIDEgNDAuOTggMjl6Ii8+PC9zdmc+'
    )
    given({ name: 'dependabot', color: 'blue' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NCA1NCIgZmlsbD0iIzAwN2VjNiI+PHBhdGggZD0iTTI1IDNhMSAxIDAgMCAwLTEgMXY3YTEgMSAwIDAgMCAxIDFoNXYzSDZhMyAzIDAgMCAwLTMgM3YxMkgxYTEgMSAwIDAgMC0xIDF2MTBhMSAxIDAgMCAwIDEgMWgydjZhMyAzIDAgMCAwIDMgM2g0MmEzIDMgMCAwIDAgMy0zdi02aDJhMSAxIDAgMCAwIDEtMVYzMWExIDEgMCAwIDAtMS0xaC0yVjE4YTMgMyAwIDAgMC0zLTNIMzNWNGExIDEgMCAwIDAtMS0xaC03em0tMy45ODIgMjZhMS4yMSAxLjIxIDAgMCAxIC44MzcuMzU1bDEuMjkgMS4yOWExLjIxIDEuMjEgMCAwIDEgMCAxLjcwOSAxLjIxIDEuMjEgMCAwIDEgMCAuMDAxbC02LjI5MSA2LjI5YTEuMjEgMS4yMSAwIDAgMS0xLjcxIDBsLTMuNzktMy43OTFhMS4yMSAxLjIxIDAgMCAxIDAtMS43MWwxLjI5LTEuMjlhMS4yMSAxLjIxIDAgMCAxIDEuNzEgMEwxNiAzMy41bDQuMTQ1LTQuMTQ1YTEuMjEgMS4yMSAwIDAgMSAuODczLS4zNTV6bTE5Ljk2MiAwYTEuMjEgMS4yMSAwIDAgMSAuODc0LjM1NGwxLjI5IDEuMjlhMS4yMSAxLjIxIDAgMCAxIDAgMS43MWwtNi4yOSA2LjI4OXYuMDAyYTEuMjEgMS4yMSAwIDAgMS0xLjcxMSAwbC0zLjc5LTMuNzlhMS4yMSAxLjIxIDAgMCAxIDAtMS43MWwxLjI5LTEuMjlhMS4yMSAxLjIxIDAgMCAxIDEuNzEgMGwxLjY0NSAxLjY0NSA0LjE0Ny00LjE0NkExLjIxIDEuMjEgMCAwIDEgNDAuOTggMjl6Ii8+PC9zdmc+'
    )

    it('preserves color if light logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'javascript' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#F7DF1E"')
    })
    it('recolors logo if light logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'javascript', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#333"')
    })

    it('preserves color if dark logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'nuget', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#004880"')
    })
    it('recolors logo if dark logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'nuget' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="whitesmoke"')
    })

    it('preserves color if medium logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'skype' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#00AFF0"')
    })
    it('preserves color if medium logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'skype', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#00AFF0"')
    })
  })

  test(getSimpleIcon, () => {
    // https://github.com/badges/shields/issues/4016
    given({ name: 'get' }).expect(undefined)
    // https://github.com/badges/shields/issues/4263
    given({ name: 'get', color: 'blue' }).expect(undefined)
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
