'use strict'

const { expect } = require('chai')
const { checkErrorResponse } = require('./github-helpers')

describe('GitHub Error Handler', function() {
  it('makes repo not found badge when 422 is returned', function() {
    const badgeData = { text: [] }
    expect(checkErrorResponse(badgeData, null, { statusCode: 422 })).to.be.true
    expect(badgeData.text[1]).to.equal('repo not found')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })

  it('makes user not found badge when 404 is returned', function() {
    const badgeData = { text: [] }
    expect(
      checkErrorResponse(badgeData, null, { statusCode: 404 }, 'user not found')
    ).to.be.true
    expect(badgeData.text[1]).to.equal('user not found')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })

  it('makes badge with custom message when specified', function() {
    const badgeData = { text: [] }
    expect(
      checkErrorResponse(
        badgeData,
        null,
        { statusCode: 418 },
        'repo not found',
        { 418: "I'm a teapot" }
      )
    ).to.be.true
    expect(badgeData.text[1]).to.equal("I'm a teapot")
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })
})
