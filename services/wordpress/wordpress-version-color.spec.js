import { expect } from 'chai'
import { toSemver } from './wordpress-version-color.js'

describe('toSemver() function', function () {
  it('coerces versions', function () {
    expect(toSemver('1.1.1')).to.equal('1.1.1')
    expect(toSemver('4.2')).to.equal('4.2.0')
    expect(toSemver('1.0.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('1.0-beta')).to.equal('1.0.0-beta')
    expect(toSemver('foobar')).to.equal('foobar')
  })
})
