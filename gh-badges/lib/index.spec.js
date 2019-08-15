'use strict'

const { expect } = require('chai')
const isSvg = require('is-svg')
const { BadgeFactory, ValidationError } = require('.')

const bf = new BadgeFactory()

describe('BadgeFactory class', function() {
  it('should produce badge with valid input', function() {
    expect(
      bf.create({
        text: ['build', 'passed'],
      })
    ).to.satisfy(isSvg)
    expect(
      bf.create({
        text: ['build', 'passed'],
        format: 'svg',
        colorscheme: 'green',
        template: 'flat',
      })
    ).to.satisfy(isSvg)
    expect(
      bf.create({
        text: ['build', 'passed'],
        foo: 'bar',
      })
    ).to.satisfy(isSvg)
  })

  it('should throw a ValidationError with invalid inputs', function() {
    expect(() => bf.create({})).to.throw(
      ValidationError,
      'Field `text` is required'
    )
    expect(() => bf.create({ text: ['build'] })).to.throw(
      ValidationError,
      'Field `text` must be an array of 2 strings'
    )
    expect(() =>
      bf.create({ text: ['build', 'passed', 'something else'] })
    ).to.throw(ValidationError, 'Field `text` must be an array of 2 strings')
    expect(() =>
      bf.create({ text: ['build', 'passed'], labelColor: 7 })
    ).to.throw(ValidationError, 'Field `labelColor` must be of type string')
    expect(() =>
      bf.create({ text: ['build', 'passed'], format: 'png' })
    ).to.throw(ValidationError, 'Field `format` must be one of (svg,json)')
    expect(() =>
      bf.create({ text: ['build', 'passed'], template: 'something else' })
    ).to.throw(
      ValidationError,
      'Field `template` must be one of (plastic,flat,flat-square,for-the-badge,popout,popout-square,social)'
    )
  })
})
