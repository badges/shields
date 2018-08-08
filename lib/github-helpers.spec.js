'use strict'

const { expect } = require('chai')
const { checkErrorResponse } = require('./github-helpers')

describe('GitHub Error Handler', function() {
  it('makes not found badge when 422 is returned', function() {
    const badgeData = { text: [] }
    expect(
      checkErrorResponse(badgeData, null, { statusCode: 422 }, 'repo not found')
    ).to.be.true
    expect(badgeData.text[1]).to.equal('repo not found')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })
})
