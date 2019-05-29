'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')
const isSvg = require('is-svg')
const { BadgeFactory } = require('.')

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
    expect(() => bf.create({})).to.throw(Joi.ValidationError)
    expect(() => bf.create({ text: ['build'] })).to.throw(Joi.ValidationError)
    expect(() =>
      bf.create({ text: ['build', 'passed', 'something else'] })
    ).to.throw(Joi.ValidationError)
    expect(() =>
      bf.create({ text: ['build', 'passed'], format: 'png' })
    ).to.throw(Joi.ValidationError)
    expect(() =>
      bf.create({ text: ['build', 'passed'], template: 'something else' })
    ).to.throw(Joi.ValidationError)
  })
})
