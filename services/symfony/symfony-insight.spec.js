import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import SymfonyInsightGrade from './symfony-insight-grade.service.js'
import SymfonyInsightStars from './symfony-insight-stars.service.js'
import SymfonyInsightViolations from './symfony-insight-violations.service.js'
import {
  sampleProjectUuid as projectUuid,
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  noGradeMockResponse,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
  user,
  token,
  config,
} from './symfony-test-helpers.js'

// These tests are organized in a fairly unusual way because the service uses
// XML, so it's difficult to decouple the parsing from the transform + render.
// It also requires authentication so the tests must be written using a .spec
// instead of a .tester.
//
// In most other cases, do not follow this pattern. Instead, write a .spec file
// with sazerac tests of the transform and render functions.
describe('SymfonyInsight[Grade|Stars|Violation]', function () {
  cleanUpNockAfterEach()

  function createMock() {
    return nock('https://insight.symfony.com/api/projects')
      .get(`/${projectUuid}`)
      .basicAuth({ user, pass: token })
  }

  it('401 not authorized grade', async function () {
    const scope = createMock().reply(401)
    expect(
      await SymfonyInsightGrade.invoke(defaultContext, config, { projectUuid })
    ).to.deep.equal({
      message: 'not authorized to access project',
      color: 'lightgray',
      isError: true,
    })
    scope.done()
  })

  function testBadges({
    description,
    response,
    expectedGradeBadge,
    expectedStarsBadge,
    expectedViolationsBadge,
    ...rest
  }) {
    if (Object.keys(rest).length > 0) {
      throw Error(`Oops, what are those doing there: ${rest.join(', ')}`)
    }

    describe(description, function () {
      if (expectedGradeBadge) {
        it('grade', async function () {
          const scope = createMock().reply(200, response)
          expect(
            await SymfonyInsightGrade.invoke(defaultContext, config, {
              projectUuid,
            })
          ).to.deep.equal(expectedGradeBadge)
          scope.done()
        })
      }

      if (expectedStarsBadge) {
        it('stars', async function () {
          const scope = createMock().reply(200, response)
          expect(
            await SymfonyInsightStars.invoke(defaultContext, config, {
              projectUuid,
            })
          ).to.deep.equal(expectedStarsBadge)
          scope.done()
        })
      }

      if (expectedViolationsBadge) {
        it('violations', async function () {
          const scope = createMock().reply(200, response)
          expect(
            await SymfonyInsightViolations.invoke(defaultContext, config, {
              projectUuid,
            })
          ).to.deep.equal(expectedViolationsBadge)
          scope.done()
        })
      }
    })
  }

  testBadges({
    description: 'pending project',
    response: runningMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'pending',
      color: 'lightgrey',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: 'pending',
      color: 'lightgrey',
    },
    expectedViolationsBadge: {
      label: 'violations',
      message: 'pending',
      color: 'lightgrey',
    },
  })

  testBadges({
    description: 'platinum',
    response: platinumMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'platinum',
      color: '#e5e4e2',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: '★★★★',
      color: '#e5e4e2',
    },
  })

  testBadges({
    description: 'gold',
    response: goldMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'gold',
      color: '#ebc760',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: '★★★☆',
      color: '#ebc760',
    },
    expectedViolationsBadge: {
      label: 'violations',
      message: '0',
      color: 'brightgreen',
    },
  })

  testBadges({
    description: 'silver',
    response: silverMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'silver',
      color: '#c0c0c0',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: '★★☆☆',
      color: '#c0c0c0',
    },
  })

  testBadges({
    description: 'bronze',
    response: bronzeMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'bronze',
      color: '#c88f6a',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: '★☆☆☆',
      color: '#c88f6a',
    },
  })

  testBadges({
    description: 'no medal',
    response: noMedalMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'no medal',
      color: 'red',
    },
    expectedStarsBadge: {
      label: 'stars',
      message: '☆☆☆☆',
      color: 'red',
    },
  })

  testBadges({
    description: 'no medal',
    response: noGradeMockResponse,
    expectedGradeBadge: {
      label: 'grade',
      message: 'no medal',
      color: 'red',
    },
  })

  testBadges({
    description: 'critical violations',
    response: criticalViolation,
    expectedViolationsBadge: {
      label: 'violations',
      message: '1 critical',
      color: 'red',
    },
  })

  testBadges({
    description: 'major violations',
    response: majorViolation,
    expectedViolationsBadge: {
      label: 'violations',
      message: '1 major',
      color: 'orange',
    },
  })

  testBadges({
    description: 'minor violations',
    response: minorViolation,
    expectedViolationsBadge: {
      label: 'violations',
      message: '1 minor',
      color: 'yellow',
    },
  })

  testBadges({
    description: 'info violations',
    response: infoViolation,
    expectedViolationsBadge: {
      label: 'violations',
      message: '1 info',
      color: 'yellowgreen',
    },
  })

  testBadges({
    description: 'multiple violations',
    response: multipleViolations,
    expectedViolationsBadge: {
      label: 'violations',
      message: '1 critical, 1 info',
      color: 'red',
    },
  })
})
