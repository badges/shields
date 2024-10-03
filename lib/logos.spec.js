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
      'data:image/svg+xml;base64,PHN2ZyB4bWxu',
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
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="/><script>alert()</script>',
    ).expect(false)
  })

  test(prepareNamedLogo, () => {
    // use simple icon
    given({ name: 'github' }).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZXNtb2tlIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R2l0SHViPC90aXRsZT48cGF0aCBkPSJNMTIgLjI5N2MtNi42MyAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDMgMy40MzggOS44IDguMjA1IDExLjM4NS42LjExMy44Mi0uMjU4LjgyLS41NzcgMC0uMjg1LS4wMS0xLjA0LS4wMTUtMi4wNC0zLjMzOC43MjQtNC4wNDItMS42MS00LjA0Mi0xLjYxQzQuNDIyIDE4LjA3IDMuNjMzIDE3LjcgMy42MzMgMTcuN2MtMS4wODctLjc0NC4wODQtLjcyOS4wODQtLjcyOSAxLjIwNS4wODQgMS44MzggMS4yMzYgMS44MzggMS4yMzYgMS4wNyAxLjgzNSAyLjgwOSAxLjMwNSAzLjQ5NS45OTguMTA4LS43NzYuNDE3LTEuMzA1Ljc2LTEuNjA1LTIuNjY1LS4zLTUuNDY2LTEuMzMyLTUuNDY2LTUuOTMgMC0xLjMxLjQ2NS0yLjM4IDEuMjM1LTMuMjItLjEzNS0uMzAzLS41NC0xLjUyMy4xMDUtMy4xNzYgMCAwIDEuMDA1LS4zMjIgMy4zIDEuMjMuOTYtLjI2NyAxLjk4LS4zOTkgMy0uNDA1IDEuMDIuMDA2IDIuMDQuMTM4IDMgLjQwNSAyLjI4LTEuNTUyIDMuMjg1LTEuMjMgMy4yODUtMS4yMy42NDUgMS42NTMuMjQgMi44NzMuMTIgMy4xNzYuNzY1Ljg0IDEuMjMgMS45MSAxLjIzIDMuMjIgMCA0LjYxLTIuODA1IDUuNjI1LTUuNDc1IDUuOTIuNDIuMzYuODEgMS4wOTYuODEgMi4yMiAwIDEuNjA2LS4wMTUgMi44OTYtLjAxNSAzLjI4NiAwIC4zMTUuMjEuNjkuODI1LjU3QzIwLjU2NSAyMi4wOTIgMjQgMTcuNTkyIDI0IDEyLjI5N2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyIi8+PC9zdmc+',
    )
    // use simple icon with color
    given({ name: 'github', color: 'red' }).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZTA1ZDQ0IiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R2l0SHViPC90aXRsZT48cGF0aCBkPSJNMTIgLjI5N2MtNi42MyAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDMgMy40MzggOS44IDguMjA1IDExLjM4NS42LjExMy44Mi0uMjU4LjgyLS41NzcgMC0uMjg1LS4wMS0xLjA0LS4wMTUtMi4wNC0zLjMzOC43MjQtNC4wNDItMS42MS00LjA0Mi0xLjYxQzQuNDIyIDE4LjA3IDMuNjMzIDE3LjcgMy42MzMgMTcuN2MtMS4wODctLjc0NC4wODQtLjcyOS4wODQtLjcyOSAxLjIwNS4wODQgMS44MzggMS4yMzYgMS44MzggMS4yMzYgMS4wNyAxLjgzNSAyLjgwOSAxLjMwNSAzLjQ5NS45OTguMTA4LS43NzYuNDE3LTEuMzA1Ljc2LTEuNjA1LTIuNjY1LS4zLTUuNDY2LTEuMzMyLTUuNDY2LTUuOTMgMC0xLjMxLjQ2NS0yLjM4IDEuMjM1LTMuMjItLjEzNS0uMzAzLS41NC0xLjUyMy4xMDUtMy4xNzYgMCAwIDEuMDA1LS4zMjIgMy4zIDEuMjMuOTYtLjI2NyAxLjk4LS4zOTkgMy0uNDA1IDEuMDIuMDA2IDIuMDQuMTM4IDMgLjQwNSAyLjI4LTEuNTUyIDMuMjg1LTEuMjMgMy4yODUtMS4yMy42NDUgMS42NTMuMjQgMi44NzMuMTIgMy4xNzYuNzY1Ljg0IDEuMjMgMS45MSAxLjIzIDMuMjIgMCA0LjYxLTIuODA1IDUuNjI1LTUuNDc1IDUuOTIuNDIuMzYuODEgMS4wOTYuODEgMi4yMiAwIDEuNjA2LS4wMTUgMi44OTYtLjAxNSAzLjI4NiAwIC4zMTUuMjEuNjkuODI1LjU3QzIwLjU2NSAyMi4wOTIgMjQgMTcuNTkyIDI0IDEyLjI5N2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyIi8+PC9zdmc+',
    )
    // use simple icon with auto logo size
    given({ name: 'amd', size: 'auto' }).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZXNtb2tlIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCA1LjcyNTk5OTk5OTk5OTk5OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QU1EPC90aXRsZT48cGF0aCBkPSJNMTguMzI0IDBsMS41NTkgMS41NmgyLjU1NnYyLjU1N0wyNCA1LjY3N1Ywek0yIDAuMzgzbC0yIDQuOTZoMS4zMDlsMC4zNy0wLjk4MkgzLjlsMC40MDggMC45ODJoMS4zMzhMMy40MzIgMC4zODN6IG00LjIwOSAwdjQuOTU1aDEuMjM4di0zLjA5MmwxLjMzOCAxLjU2MmgwLjE4OGwxLjMzOC0xLjU1NnYzLjA5MWgxLjIzOFYwLjM4M0gxMC40N2wtMS41OTIgMS44NDVMNy4yODcgMC4zODN6IG02LjI4MyAwdjQuOTZoMi4wNTdjMS45NzkgMCAyLjg4LTEuMDQ2IDIuODgtMi40NzIgMC0xLjM2LTAuOTM3LTIuNDg4LTIuNzQ3LTIuNDg4eiBtMS4yMzcgMC45MWgwLjc5MmMxLjE3IDAgMS42MyAwLjcxMSAxLjYzIDEuNTcgMCAwLjcyOC0wLjM3MiAxLjU3Mi0xLjYxNiAxLjU3MmgtMC44MDZ6IG0tMTAuOTg1IDAuMjczbDAuNzkxIDEuOTMySDIuMDA4eiBtMTcuMTM3IDAuMzA3bC0xLjYwNCAxLjYwM3YyLjI1aDIuMjQ2bDEuNjA0LTEuNjA3aC0yLjI0NnoiLz48L3N2Zz4=',
    )
    // use simple icon with color & auto logo size
    given({ name: 'amd', color: 'white', size: 'auto' }).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgNS43MjU5OTk5OTk5OTk5OTkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlPkFNRDwvdGl0bGU+PHBhdGggZD0iTTE4LjMyNCAwbDEuNTU5IDEuNTZoMi41NTZ2Mi41NTdMMjQgNS42NzdWMHpNMiAwLjM4M2wtMiA0Ljk2aDEuMzA5bDAuMzctMC45ODJIMy45bDAuNDA4IDAuOTgyaDEuMzM4TDMuNDMyIDAuMzgzeiBtNC4yMDkgMHY0Ljk1NWgxLjIzOHYtMy4wOTJsMS4zMzggMS41NjJoMC4xODhsMS4zMzgtMS41NTZ2My4wOTFoMS4yMzhWMC4zODNIMTAuNDdsLTEuNTkyIDEuODQ1TDcuMjg3IDAuMzgzeiBtNi4yODMgMHY0Ljk2aDIuMDU3YzEuOTc5IDAgMi44OC0xLjA0NiAyLjg4LTIuNDcyIDAtMS4zNi0wLjkzNy0yLjQ4OC0yLjc0Ny0yLjQ4OHogbTEuMjM3IDAuOTFoMC43OTJjMS4xNyAwIDEuNjMgMC43MTEgMS42MyAxLjU3IDAgMC43MjgtMC4zNzIgMS41NzItMS42MTYgMS41NzJoLTAuODA2eiBtLTEwLjk4NSAwLjI3M2wwLjc5MSAxLjkzMkgyLjAwOHogbTE3LjEzNyAwLjMwN2wtMS42MDQgMS42MDN2Mi4yNWgyLjI0NmwxLjYwNC0xLjYwN2gtMi4yNDZ6Ii8+PC9zdmc+',
    )

    it('preserves color if light logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'javascript' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#F7DF1E"')
    })
    it('recolors logo if light logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'javascript', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#333"')
    })

    it('preserves color if dark logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'nuget', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#004880"')
    })
    it('recolors logo if dark logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'nuget' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="whitesmoke"')
    })

    it('preserves color if medium logo on dark background', function () {
      const logo = prepareNamedLogo({ name: 'android' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#34A853"')
    })
    it('preserves color if medium logo on light background', function () {
      const logo = prepareNamedLogo({ name: 'android', style: 'social' })
      const decodedLogo = Buffer.from(
        logo.replace('data:image/svg+xml;base64,', ''),
        'base64',
      ).toString('ascii')
      expect(decodedLogo).to.contain('fill="#34A853"')
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
      undefined,
    )
    given('npm', {}).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZXNtb2tlIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+bnBtPC90aXRsZT48cGF0aCBkPSJNMS43NjMgMEMuNzg2IDAgMCAuNzg2IDAgMS43NjN2MjAuNDc0QzAgMjMuMjE0Ljc4NiAyNCAxLjc2MyAyNGgyMC40NzRjLjk3NyAwIDEuNzYzLS43ODYgMS43NjMtMS43NjNWMS43NjNDMjQgLjc4NiAyMy4yMTQgMCAyMi4yMzcgMHpNNS4xMyA1LjMyM2wxMy44MzcuMDE5LS4wMDkgMTMuODM2aC0zLjQ2NGwuMDEtMTAuMzgyaC0zLjQ1NkwxMi4wNCAxOS4xN0g1LjExM3oiLz48L3N2Zz4=',
    )
  })
})
