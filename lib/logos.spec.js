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
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZXNtb2tlIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCA1LjcyNTk5OTk5OTk5OTk5OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+QU1EPC90aXRsZT48cGF0aCBkPSJNMTguMzI0IDBMMTkuODgzIDEuNTZIMjIuNDM5VjQuMTE3TDI0IDUuNjc3VjBaTTIgMC4zODNMMCA1LjM0M0gxLjMwOUwxLjY3OSA0LjM2MUgzLjlMNC4zMDggNS4zNDNINS42NDZMMy40MzIgMC4zODNaTTYuMjA5IDAuMzgzVjUuMzM4SDcuNDQ3VjIuMjQ2TDguNzg1IDMuODA4SDguOTczTDEwLjMxMSAyLjI1MlY1LjM0M0gxMS41NDlWMC4zODNIMTAuNDdMOC44NzggMi4yMjhMNy4yODcgMC4zODNaTTEyLjQ5MiAwLjM4M1Y1LjM0M0gxNC41NDlDMTYuNTI4IDUuMzQzIDE3LjQyOSA0LjI5NyAxNy40MjkgMi44NzFDMTcuNDI5IDEuNTExIDE2LjQ5MiAwLjM4MyAxNC42ODIgMC4zODNaTTEzLjcyOSAxLjI5M0gxNC41MjFDMTUuNjkxIDEuMjkzIDE2LjE1MSAyLjAwNCAxNi4xNTEgMi44NjNDMTYuMTUxIDMuNTkxIDE1Ljc3OSA0LjQzNSAxNC41MzUgNC40MzVIMTMuNzI5Wk0yLjc0NCAxLjU2NkwzLjUzNSAzLjQ5OEgyLjAwOFpNMTkuODgxIDEuODczTDE4LjI3NyAzLjQ3NlY1LjcyNkgyMC41MjNMMjIuMTI3IDQuMTE5SDE5Ljg4MVoiLz48L3N2Zz4=',
    )
    // use simple icon with color & auto logo size
    given({ name: 'amd', color: 'white', size: 'auto' }).expect(
      'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgNS43MjU5OTk5OTk5OTk5OTkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlPkFNRDwvdGl0bGU+PHBhdGggZD0iTTE4LjMyNCAwTDE5Ljg4MyAxLjU2SDIyLjQzOVY0LjExN0wyNCA1LjY3N1YwWk0yIDAuMzgzTDAgNS4zNDNIMS4zMDlMMS42NzkgNC4zNjFIMy45TDQuMzA4IDUuMzQzSDUuNjQ2TDMuNDMyIDAuMzgzWk02LjIwOSAwLjM4M1Y1LjMzOEg3LjQ0N1YyLjI0Nkw4Ljc4NSAzLjgwOEg4Ljk3M0wxMC4zMTEgMi4yNTJWNS4zNDNIMTEuNTQ5VjAuMzgzSDEwLjQ3TDguODc4IDIuMjI4TDcuMjg3IDAuMzgzWk0xMi40OTIgMC4zODNWNS4zNDNIMTQuNTQ5QzE2LjUyOCA1LjM0MyAxNy40MjkgNC4yOTcgMTcuNDI5IDIuODcxQzE3LjQyOSAxLjUxMSAxNi40OTIgMC4zODMgMTQuNjgyIDAuMzgzWk0xMy43MjkgMS4yOTNIMTQuNTIxQzE1LjY5MSAxLjI5MyAxNi4xNTEgMi4wMDQgMTYuMTUxIDIuODYzQzE2LjE1MSAzLjU5MSAxNS43NzkgNC40MzUgMTQuNTM1IDQuNDM1SDEzLjcyOVpNMi43NDQgMS41NjZMMy41MzUgMy40OThIMi4wMDhaTTE5Ljg4MSAxLjg3M0wxOC4yNzcgMy40NzZWNS43MjZIMjAuNTIzTDIyLjEyNyA0LjExOUgxOS44ODFaIi8+PC9zdmc+',
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
