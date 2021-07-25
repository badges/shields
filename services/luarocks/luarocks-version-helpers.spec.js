import { test, given, forCases } from 'sazerac'
import {
  parseVersion,
  compareVersionLists,
  latestVersion,
} from './luarocks-version-helpers.js'

describe('LuaRocks-specific helpers', function () {
  test(compareVersionLists, () => {
    forCases([
      given([1, 2], [1, 2]),
      given([1, 2, 0], [1, 2]),
      given([1, 2], [1, 2, 0, 0]),
      given([-1, -2], [-1, -2, 0, 0]),
      given([], []),
    ])
      .describe('when given [%s] and [%s]')
      .expect(0)
      .should('should be equal')

    forCases([
      given([1, 2], [2, 1]),
      given([3, 2], [3, 2, 1]),
      given([-3, -2], [3, 2]),
      given([3, 2, -1], [3, 2]),
      given([-1], []),
      given([], [1]),
    ])
      .describe('when given [%s] and [%s]')
      .expect(-1)
      .should('should be less')

    forCases([
      given([1, 2, 1, 2], [1, 2, 0, 2]),
      given([5, 2, 0, 1], [5, 2]),
      given([-5, 2], [-6, 3, 1]),
      given([1, 2], [1, 2, -1, 1]),
      given([1, 2, 0, -1], [1, 2, -1, 1]),
      given([], [-1, 2]),
      given([1, -1], []),
    ])
      .describe('when given [%s] and [%s]')
      .expect(1)
      .should('should be greater')
  })

  test(parseVersion, () => {
    given('1.2.3-1').expect([1, 2, 3, 1])
    given('10.02-3').expect([10, 2, 3])
    given('3.0rc1-2').expect([3, 0, -1399, 2])
    given('2.0-alpha').expect([2, 0, -3100])
    given('2.0-beta').expect([2, 0, -3000])
    given('2.0-beta5').expect([2, 0, -2995])
  })

  test(latestVersion, () => {
    given(['1.2.4-3', '1.2.4-4', '1.2.6-1']).expect('1.2.6-1')
    given(['1.2.4-3']).expect('1.2.4-3')
  })
})
