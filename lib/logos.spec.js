'use strict'

const { test, given, forCases } = require('sazerac')
const {
  prependPrefix,
  isDataUrl,
  prepareNamedLogo,
  getSimpleIconColor,
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
    given({ name: 'github' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMTIgMTIgNDAgNDAiPgo8cGF0aCBmaWxsPSIjMzMzMzMzIiBkPSJNMzIsMTMuNGMtMTAuNSwwLTE5LDguNS0xOSwxOWMwLDguNCw1LjUsMTUuNSwxMywxOGMxLDAuMiwxLjMtMC40LDEuMy0wLjljMC0wLjUsMC0xLjcsMC0zLjIgYy01LjMsMS4xLTYuNC0yLjYtNi40LTIuNkMyMCw0MS42LDE4LjgsNDEsMTguOCw0MWMtMS43LTEuMiwwLjEtMS4xLDAuMS0xLjFjMS45LDAuMSwyLjksMiwyLjksMmMxLjcsMi45LDQuNSwyLjEsNS41LDEuNiBjMC4yLTEuMiwwLjctMi4xLDEuMi0yLjZjLTQuMi0wLjUtOC43LTIuMS04LjctOS40YzAtMi4xLDAuNy0zLjcsMi01LjFjLTAuMi0wLjUtMC44LTIuNCwwLjItNWMwLDAsMS42LTAuNSw1LjIsMiBjMS41LTAuNCwzLjEtMC43LDQuOC0wLjdjMS42LDAsMy4zLDAuMiw0LjcsMC43YzMuNi0yLjQsNS4yLTIsNS4yLTJjMSwyLjYsMC40LDQuNiwwLjIsNWMxLjIsMS4zLDIsMywyLDUuMWMwLDcuMy00LjUsOC45LTguNyw5LjQgYzAuNywwLjYsMS4zLDEuNywxLjMsMy41YzAsMi42LDAsNC42LDAsNS4yYzAsMC41LDAuNCwxLjEsMS4zLDAuOWM3LjUtMi42LDEzLTkuNywxMy0xOC4xQzUxLDIxLjksNDIuNSwxMy40LDMyLDEzLjR6Ii8+Cjwvc3ZnPgo='
    )
    given({ name: 'github', color: 'blue' }).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMTIgMTIgNDAgNDAiPgo8cGF0aCBmaWxsPSIjMDA3ZWM2IiBkPSJNMzIsMTMuNGMtMTAuNSwwLTE5LDguNS0xOSwxOWMwLDguNCw1LjUsMTUuNSwxMywxOGMxLDAuMiwxLjMtMC40LDEuMy0wLjljMC0wLjUsMC0xLjcsMC0zLjIgYy01LjMsMS4xLTYuNC0yLjYtNi40LTIuNkMyMCw0MS42LDE4LjgsNDEsMTguOCw0MWMtMS43LTEuMiwwLjEtMS4xLDAuMS0xLjFjMS45LDAuMSwyLjksMiwyLjksMmMxLjcsMi45LDQuNSwyLjEsNS41LDEuNiBjMC4yLTEuMiwwLjctMi4xLDEuMi0yLjZjLTQuMi0wLjUtOC43LTIuMS04LjctOS40YzAtMi4xLDAuNy0zLjcsMi01LjFjLTAuMi0wLjUtMC44LTIuNCwwLjItNWMwLDAsMS42LTAuNSw1LjIsMiBjMS41LTAuNCwzLjEtMC43LDQuOC0wLjdjMS42LDAsMy4zLDAuMiw0LjcsMC43YzMuNi0yLjQsNS4yLTIsNS4yLTJjMSwyLjYsMC40LDQuNiwwLjIsNWMxLjIsMS4zLDIsMywyLDUuMWMwLDcuMy00LjUsOC45LTguNyw5LjQgYzAuNywwLjYsMS4zLDEuNywxLjMsMy41YzAsMi42LDAsNC42LDAsNS4yYzAsMC41LDAuNCwxLjEsMS4zLDAuOWM3LjUtMi42LDEzLTkuNywxMy0xOC4xQzUxLDIxLjksNDIuNSwxMy40LDMyLDEzLjR6Ii8+Cjwvc3ZnPgo='
    )
  })

  test(getSimpleIconColor, () => {
    given({ icon: { hex: 'F7DF1E' }, style: undefined }).expect('F7DF1E') // light logo, dark background
    given({ icon: { hex: 'F7DF1E' }, style: 'social' }).expect('#333') // light logo, light background
    given({ icon: { hex: '004880' }, style: undefined }).expect('whitesmoke') // dark logo, dark background
    given({ icon: { hex: '004880' }, style: 'social' }).expect('004880') // dark logo, light background
    given({ icon: { hex: '00AFF0' }, style: undefined }).expect('00AFF0') // medium logo, dark background
    given({ icon: { hex: '00AFF0' }, style: 'social' }).expect('00AFF0') // medium logo, light background
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
    given('github', {}).expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMTIgMTIgNDAgNDAiPgo8cGF0aCBmaWxsPSIjMzMzMzMzIiBkPSJNMzIsMTMuNGMtMTAuNSwwLTE5LDguNS0xOSwxOWMwLDguNCw1LjUsMTUuNSwxMywxOGMxLDAuMiwxLjMtMC40LDEuMy0wLjljMC0wLjUsMC0xLjcsMC0zLjIgYy01LjMsMS4xLTYuNC0yLjYtNi40LTIuNkMyMCw0MS42LDE4LjgsNDEsMTguOCw0MWMtMS43LTEuMiwwLjEtMS4xLDAuMS0xLjFjMS45LDAuMSwyLjksMiwyLjksMmMxLjcsMi45LDQuNSwyLjEsNS41LDEuNiBjMC4yLTEuMiwwLjctMi4xLDEuMi0yLjZjLTQuMi0wLjUtOC43LTIuMS04LjctOS40YzAtMi4xLDAuNy0zLjcsMi01LjFjLTAuMi0wLjUtMC44LTIuNCwwLjItNWMwLDAsMS42LTAuNSw1LjIsMiBjMS41LTAuNCwzLjEtMC43LDQuOC0wLjdjMS42LDAsMy4zLDAuMiw0LjcsMC43YzMuNi0yLjQsNS4yLTIsNS4yLTJjMSwyLjYsMC40LDQuNiwwLjIsNWMxLjIsMS4zLDIsMywyLDUuMWMwLDcuMy00LjUsOC45LTguNyw5LjQgYzAuNywwLjYsMS4zLDEuNywxLjMsMy41YzAsMi42LDAsNC42LDAsNS4yYzAsMC41LDAuNCwxLjEsMS4zLDAuOWM3LjUtMi42LDEzLTkuNywxMy0xOC4xQzUxLDIxLjksNDIuNSwxMy40LDMyLDEzLjR6Ii8+Cjwvc3ZnPgo='
    )
  })
})
