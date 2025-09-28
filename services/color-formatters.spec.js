import { expect } from 'chai'
import { forCases, given, test } from 'sazerac'
import {
  colorScale,
  coveragePercentage,
  letterScore,
  pep440VersionColor,
  version,
} from './color-formatters.js'

describe('Color formatters', function () {
  const byPercentage = colorScale([Number.EPSILON, 80, 90, 100])

  test(byPercentage, () => {
    given(-1).expect('red')
    given(0).expect('red')
    given(0.5).expect('yellow')
    given(1).expect('yellow')
    given(50).expect('yellow')
    given(80).expect('yellowgreen')
    given(85).expect('yellowgreen')
    given(90).expect('green')
    given(100).expect('brightgreen')
    given(101).expect('brightgreen')

    forCases(
      [-1, 0, 0.5, 1, 50, 80, 85, 90, 100, 101].map(v =>
        given(v).expect(coveragePercentage(v)),
      ),
    ).should("return '%s', for parity with coveragePercentage()")
  })

  context('when reversed', function () {
    test(colorScale([7, 30, 180, 365, 730], undefined, true), () => {
      given(3).expect('brightgreen')
      given(7).expect('green')
      given(10).expect('green')
      given(60).expect('yellowgreen')
      given(250).expect('yellow')
      given(400).expect('orange')
      given(800).expect('red')
    })
  })

  test(letterScore, () => {
    given('A').expect('brightgreen')
    given('B').expect('green')
    given('C').expect('yellowgreen')
    given('D').expect('yellow')
    given('E').expect('orange')
    given('F').expect('red')
    given('Z').expect('red')
  })

  test(version, () => {
    forCases([given('1.0'), given(9), given(1.0)]).expect('blue')

    forCases([
      given(0.1),
      given('0.9'),
      given('1.0-Beta'),
      given('1.1-alpha'),
      given('6.0-SNAPSHOT'),
      given('1.0.1-dev'),
      given('2.1.6-prerelease'),
      given('2.1.6-RC1'),
      given('cvs-1'),
      given('scm-2'),
    ]).expect('orange')

    expect(() => version(null)).to.throw(
      Error,
      "Can't generate a version color for null",
    )
    expect(() => version(undefined)).to.throw(
      Error,
      "Can't generate a version color for undefined",
    )
    expect(() => version(true)).to.throw(
      Error,
      "Can't generate a version color for true",
    )
    expect(() => version({})).to.throw(
      Error,
      "Can't generate a version color for [object Object]",
    )
  })

  test(pep440VersionColor, () => {
    forCases([
      given('1.0.1'),
      given('v2.1.6'),
      given('1.0.1+abcd'),
      given('1.0'),
      given('v1'),
      given(9),
      given(1.0),
    ]).expect('blue')

    forCases([
      given('1.0.1-rc1'),
      given('1.0.1rc1'),
      given('1.0.0-Beta'),
      given('1.0.0Beta'),
      given('1.1.0-alpha'),
      given('1.1.0alpha'),
      given('1.0.1-dev'),
      given('1.0.1dev'),
      given('2.1.6-b1'),
      given('2.1.6b1'),
      given('0.1.0'),
      given('v0.1.0'),
      given('v2.1.6-b1'),
      given('0.1.0+abcd'),
      given('2.1.6-b1+abcd'),
      given('0.0.0'),
      given(0.1),
      given('0.9'),
    ]).expect('orange')

    forCases([
      given('6.0.0-SNAPSHOT'),
      given('2.1.6-prerelease'),
      given(true),
      given(null),
      given('cheese'),
    ]).expect('lightgrey')
  })
})
