import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import LiberapayGoal from './liberapay-goal.service.js'

describe('LiberapayGoal', function () {
  test(LiberapayGoal.prototype.transform, () => {
    given({ goal: {}, receiving: null }).expect({
      percentAchieved: 0,
    })
    given({ goal: { amount: 100 }, receiving: { amount: 89 } }).expect({
      percentAchieved: 89,
    })
  })

  it('throws InvalidResponse on missing goals', function () {
    expect(() =>
      LiberapayGoal.prototype.transform({ goal: null, receiving: null })
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'no public goals')
  })
})
