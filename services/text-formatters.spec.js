'use strict'

const { test, given } = require('sazerac')
const sinon = require('sinon')
const {
  starRating,
  currencyFromCode,
  ordinalNumber,
  metric,
  omitv,
  addv,
  maybePluralize,
  formatDate,
  formatRelativeDate,
  renderTestResultMessage,
  renderTestResultBadge,
} = require('./text-formatters')

describe('Text formatters', function() {
  test(starRating, () => {
    given(4.9).expect('★★★★★')
    given(3.7).expect('★★★¾☆')
    given(2.566).expect('★★½☆☆')
    given(2.2).expect('★★¼☆☆')
    given(3).expect('★★★☆☆')
  })

  test(currencyFromCode, () => {
    given('CNY').expect('¥')
    given('EUR').expect('€')
    given('GBP').expect('₤')
    given('USD').expect('$')
    given('AUD').expect('AUD')
  })

  test(ordinalNumber, () => {
    given(2).expect('2ⁿᵈ')
    given(11).expect('11ᵗʰ')
    given(23).expect('23ʳᵈ')
    given(131).expect('131ˢᵗ')
  })

  test(metric, () => {
    given(999).expect('999')
    given(1000).expect('1k')
    given(999499).expect('999k')
    given(999500).expect('1M')
    given(1578896212).expect('2G')
    given(80000000000000).expect('80T')
    given(4000000000000001).expect('4P')
    given(71007000100580002000).expect('71E')
    given(1000000000000000000000).expect('1Z')
    given(2222222222222222222222222).expect('2Y')
  })

  test(omitv, () => {
    given('hello').expect('hello')
    given('v1.0.1').expect('1.0.1')
  })

  test(addv, () => {
    given(9).expect('v9')
    given(0.1).expect('v0.1')
    given('1.0.0').expect('v1.0.0')
    given('v0.6').expect('v0.6')
    given('hello').expect('hello')
    given('2017-05-05-Release-2.3.17').expect('2017-05-05-Release-2.3.17')
  })

  test(maybePluralize, () => {
    given('foo', []).expect('foos')
    given('foo', [123]).expect('foo')
    given('foo', [123, 456]).expect('foos')
    given('foo', undefined).expect('foos')

    given('box', [], 'boxes').expect('boxes')
    given('box', [123], 'boxes').expect('box')
    given('box', [123, 456], 'boxes').expect('boxes')
    given('box', undefined, 'boxes').expect('boxes')
  })

  test(formatDate, () => {
    given(1465513200000)
      .describe('when given a timestamp in june 2016')
      .expect('june 2016')
  })

  context('in october', function() {
    let clock
    beforeEach(function() {
      clock = sinon.useFakeTimers(new Date(2017, 9, 15).getTime())
    })
    afterEach(function() {
      clock.restore()
    })

    test(formatDate, () => {
      given(new Date(2017, 0, 1).getTime())
        .describe('when given the beginning of this year')
        .expect('january')
    })
  })

  context('in october', function() {
    let clock
    beforeEach(function() {
      clock = sinon.useFakeTimers(new Date(2018, 9, 29).getTime())
    })
    afterEach(function() {
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
  })

  function renderBothStyles(props) {
    const { message: standardMessage, color } = renderTestResultBadge(props)
    const compactMessage = renderTestResultMessage({
      ...props,
      isCompact: true,
    })
    return { standardMessage, compactMessage, color }
  }

  test(renderBothStyles, () => {
    given({ passed: 12, failed: 3, skipped: 3, total: 18 }).expect({
      standardMessage: '12 passed, 3 failed, 3 skipped',
      compactMessage: '✔ 12 | ✘ 3 | ➟ 3',
      color: 'red',
    })
    given({ passed: 12, failed: 3, skipped: 0, total: 15 }).expect({
      standardMessage: '12 passed, 3 failed',
      compactMessage: '✔ 12 | ✘ 3',
      color: 'red',
    })
    given({ passed: 12, failed: 0, skipped: 3, total: 15 }).expect({
      standardMessage: '12 passed, 3 skipped',
      compactMessage: '✔ 12 | ➟ 3',
      color: 'green',
    })
    given({ passed: 0, failed: 0, skipped: 3, total: 3 }).expect({
      standardMessage: '0 passed, 3 skipped',
      compactMessage: '✔ 0 | ➟ 3',
      color: 'yellow',
    })
    given({ passed: 12, failed: 0, skipped: 0, total: 12 }).expect({
      standardMessage: '12 passed',
      compactMessage: '✔ 12',
      color: 'brightgreen',
    })
    given({ passed: 0, failed: 0, skipped: 0, total: 0 }).expect({
      standardMessage: 'no tests',
      compactMessage: 'no tests',
      color: 'yellow',
    })
  })
})
