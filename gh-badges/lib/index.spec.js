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
      'Field `text` required, got {}'
    )
    expect(() => bf.create({ text: ['build'] })).to.throw(
      ValidationError,
      "Expected tuple of exactly size 2, but got [ 'build' ]\nfor the field `text` of the object\nThe full value being checked was:\n{ text: [ 'build' ] }"
    )
    expect(() =>
      bf.create({ text: ['build', 'passed', 'something else'] })
    ).to.throw(
      ValidationError,
      "Expected tuple of exactly size 2, but got [ 'build', 'passed', 'something else' ]\nfor the field `text` of the object\nThe full value being checked was:\n{ text: [ 'build', 'passed', 'something else' ] }"
    )
    expect(() =>
      bf.create({ text: ['build', 'passed'], format: 'png' })
    ).to.throw(
      ValidationError,
      "Expected oneOf(svg, json), but got 'png'\nfor the field `format` of the object\nThe full value being checked was:\n{ text: [ 'build', 'passed' ], format: 'png' }"
    )
    expect(() =>
      bf.create({ text: ['build', 'passed'], template: 'something else' })
    ).to.throw(
      ValidationError,
      "Expected oneOf(plastic, flat, flat-square, for-the-badge, popout, popout-square, social), but got 'something else'\nfor the field `template` of the object\nThe full value being checked was:\n{ text: [ 'build', 'passed' ], template: 'something else' }"
    )
  })
})
