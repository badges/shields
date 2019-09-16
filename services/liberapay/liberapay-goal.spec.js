'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const LiberapayGoal = require('./liberapay-goal.service')
const { InvalidResponse } = require('..')

describe('LiberapayGoal', function() {
  test(LiberapayGoal.prototype.transform, () => {
    given({ goal: {}, receiving: null }).expect({
      percentAchieved: 0,
    })
    given({ goal: { amount: 100 }, receiving: { amount: 89 } }).expect({
      percentAchieved: 89,
    })
  })

  it('throws InvalidResponse on missing goals', function() {
    expect(() =>
      LiberapayGoal.prototype.transform({ goal: null, receiving: null })
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no public goals')
  })
})
