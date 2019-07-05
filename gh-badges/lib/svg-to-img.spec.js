'use strict'

const { expect } = require('chai')
const isPng = require('is-png')
const svg2img = require('./svg-to-img')
const makeBadge = require('./make-badge')

describe('The rasterizer', function() {
  it('should produce PNG', async function() {
    const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' })
    const data = await svg2img(svg, 'png')
    expect(data).to.satisfy(isPng)
  })
})
