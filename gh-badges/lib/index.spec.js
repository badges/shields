'use strict'

const { expect } = require('chai')
const { BadgeFactory } = require('./index')
const isSvg = require('is-svg')

const bf = new BadgeFactory()

describe('BadgeFactory class', function() {
  it('should produce badge with valid input', function() {
    expect(
      bf.create({
        text: ['build', 'passed'],
        format: 'svg',
        colorscheme: 'green',
        template: 'flat',
      })
    ).to.satisfy(isSvg)
  })
})
