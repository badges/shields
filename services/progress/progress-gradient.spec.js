import { expect } from 'chai'
import { gradientColorForPercentage, NAMED_HEX } from './progress-gradient.js'

describe('gradientColorForPercentage', function () {
  it('returns red for 0% with red-green gradient', function () {
    expect(gradientColorForPercentage(0, 'red-green')).to.equal(NAMED_HEX.red)
  })

  it('returns brightgreen for 100% with red-green gradient', function () {
    expect(gradientColorForPercentage(100, 'red-green')).to.equal(
      NAMED_HEX.brightgreen,
    )
  })

  it('returns interpolated color for 50%', function () {
    const color = gradientColorForPercentage(50, 'red-green')
    expect(color).to.match(/^#[0-9a-f]{6}$/i)
    expect(color).not.to.equal(NAMED_HEX.red)
    expect(color).not.to.equal(NAMED_HEX.brightgreen)
  })

  it('uses green-red gradient (reversed)', function () {
    expect(gradientColorForPercentage(0, 'green-red')).to.equal(
      NAMED_HEX.brightgreen,
    )
    expect(gradientColorForPercentage(100, 'green-red')).to.equal(NAMED_HEX.red)
  })

  it('supports red-yellow-green gradient', function () {
    expect(gradientColorForPercentage(0, 'red-yellow-green')).to.equal(
      NAMED_HEX.red,
    )
    expect(gradientColorForPercentage(100, 'red-yellow-green')).to.equal(
      NAMED_HEX.brightgreen,
    )
  })

  it('defaults to red-green when gradient unknown', function () {
    expect(gradientColorForPercentage(0, 'unknown')).to.equal(NAMED_HEX.red)
  })

  it('clamps percentage to 0-100', function () {
    expect(gradientColorForPercentage(-10, 'red-green')).to.equal(NAMED_HEX.red)
    expect(gradientColorForPercentage(150, 'red-green')).to.equal(
      NAMED_HEX.brightgreen,
    )
  })
})
