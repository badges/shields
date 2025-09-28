import { expect } from 'chai'
import { test, given } from 'sazerac'
import sinon from 'sinon'
import { parseDate, formatDate, formatRelativeDate, age } from './date.js'
import { InvalidResponse } from './index.js'

describe('parseDate', function () {
  it('parses valid inputs', function () {
    expect(parseDate('2024-01-01').valueOf()).to.equal(
      new Date('2024-01-01').valueOf(),
    )
    expect(parseDate('Jan 01 01:00:00 2024 GMT').valueOf()).to.equal(
      new Date('2024-01-01T01:00:00.000Z').valueOf(),
    )
    expect(parseDate('31/01/2024', 'DD/MM/YYYY').valueOf()).to.equal(
      new Date('2024-01-31T00:00:00.000Z').valueOf(),
    )
  })

  it('throws when given invalid inputs', function () {
    // not a date
    expect(() => parseDate('foo')).to.throw(InvalidResponse)
    expect(() => parseDate([])).to.throw(InvalidResponse)
    expect(() => parseDate(null)).to.throw(InvalidResponse)

    // invalid dates (only works with format string)
    expect(() => parseDate('2024-02-31', 'YYYY-MM-DD')).to.throw(
      InvalidResponse,
    )
    expect(() => parseDate('2024-12-32', 'YYYY-MM-DD')).to.throw(
      InvalidResponse,
    )

    // non-standard format with no format string
    expect(() => parseDate('31/01/2024')).to.throw(InvalidResponse)

    // parse format doesn't match date
    expect(() => parseDate('2024-01-01', 'YYYYMMDDHHmmss')).to.throw(
      InvalidResponse,
    )
  })

  test(formatDate, () => {
    given(1465513200000)
      .describe('when given a timestamp in june 2016')
      .expect('june 2016')
  })

  context('in october', function () {
    let clock
    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date(2017, 9, 15).getTime())
    })
    afterEach(function () {
      clock.restore()
    })

    test(formatDate, () => {
      given(new Date(2017, 0, 1).getTime())
        .describe('when given the beginning of this year')
        .expect('january')
    })
  })

  context('in october', function () {
    let clock
    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date(2018, 9, 29).getTime())
    })
    afterEach(function () {
      clock.restore()
    })

    test(formatRelativeDate, () => {
      given(new Date(2018, 9, 31).getTime() / 1000)
        .describe('when given the end of october')
        .expect('in 2 days')
    })

    test(formatRelativeDate, () => {
      given(new Date(2018, 9, 1).getTime() / 1000)
        .describe('when given the beginning of october')
        .expect('a month ago')
    })

    test(formatRelativeDate, () => {
      given(9999999999999)
        .describe('when given invalid date')
        .expect('invalid date')
    })
  })

  const monthsAgo = months => {
    const result = new Date()
    // This looks wack but it works.
    result.setMonth(result.getMonth() - months)
    return result
  }
  test(age, () => {
    given(Date.now())
      .describe('when given the current timestamp')
      .expect('brightgreen')
    given(new Date())
      .describe('when given the current Date')
      .expect('brightgreen')
    given(new Date(2001, 1, 1))
      .describe('when given a Date many years ago')
      .expect('red')
    given(monthsAgo(2))
      .describe('when given a Date two months ago')
      .expect('yellowgreen')
    given(monthsAgo(15))
      .describe('when given a Date 15 months ago')
      .expect('orange')
    // --- reversed --- //
    given(Date.now(), true)
      .describe('when given the current timestamp and reversed')
      .expect('red')
    given(new Date(), true)
      .describe('when given the current Date and reversed')
      .expect('red')
    given(new Date(2001, 1, 1), true)
      .describe('when given a Date many years ago and reversed')
      .expect('brightgreen')
    given(monthsAgo(2), true)
      .describe('when given a Date two months ago and reversed')
      .expect('yellow')
    given(monthsAgo(15), true)
      .describe('when given a Date 15 months ago and reversed')
      .expect('green')
  })
})
