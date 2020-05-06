'use strict'

const { expect } = require('chai')
const isSvg = require('is-svg')
const { makeBadge, ValidationError } = require('.')

describe('makeBadge function', function () {
  it('should produce badge with valid input', function () {
    expect(
      makeBadge({
        label: 'build',
        message: 'passed',
      })
    ).to.satisfy(isSvg)
    expect(
      makeBadge({
        message: 'passed',
      })
    ).to.satisfy(isSvg)
    expect(
      makeBadge({
        label: 'build',
        message: 'passed',
        color: 'green',
        style: 'flat',
      })
    ).to.satisfy(isSvg)
  })

  it('should throw a ValidationError with invalid inputs', function () {
    ;[null, undefined, 7, 'foo', 4.25].forEach(x => {
      console.log(x)
      expect(() => makeBadge(x)).to.throw(
        ValidationError,
        'makeBadge takes an argument of type object'
      )
    })
    expect(() => makeBadge({})).to.throw(
      ValidationError,
      'Field `message` is required'
    )
    expect(() => makeBadge({ label: 'build' })).to.throw(
      ValidationError,
      'Field `message` is required'
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', labelColor: 7 })
    ).to.throw(ValidationError, 'Field `labelColor` must be of type string')
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', format: 'png' })
    ).to.throw(ValidationError, "Unexpected field 'format'")
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', template: 'flat' })
    ).to.throw(ValidationError, "Unexpected field 'template'")
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', foo: 'bar' })
    ).to.throw(ValidationError, "Unexpected field 'foo'")
    expect(() =>
      makeBadge({
        label: 'build',
        message: 'passed',
        style: 'something else',
      })
    ).to.throw(
      ValidationError,
      'Field `style` must be one of (plastic,flat,flat-square,for-the-badge,social)'
    )
    expect(() =>
      makeBadge({ label: 'build', message: 'passed', style: 'popout' })
    ).to.throw(
      ValidationError,
      'Field `style` must be one of (plastic,flat,flat-square,for-the-badge,social)'
    )
  })
})
