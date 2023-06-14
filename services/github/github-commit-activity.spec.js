import { expect } from 'chai'
import sinon from 'sinon'
import { InvalidResponse } from '../index.js'
import GitHubCommitActivity from './github-commit-activity.service.js'

describe('GitHubCommitActivity', function () {
  describe('transform', function () {
    it('throws InvalidResponse on invalid branch and null object', function () {
      expect(() =>
        GitHubCommitActivity.transform({
          data: { repository: { object: null } },
        })
      )
        .to.throw(InvalidResponse)
        .with.property('prettyMessage', 'invalid branch')
    })
  })
  describe('getIntervalQueryStartDate', function () {
    /** @type {sinon.SinonFakeTimers} */
    let clock
    beforeEach(function () {
      clock = sinon.useFakeTimers()
    })
    afterEach(function () {
      clock.restore()
    })

    it('provides correct value for yearly interval', function () {
      clock.tick(new Date('2021-08-28T02:21:34.000Z').getTime())
      expect(
        GitHubCommitActivity.getIntervalQueryStartDate({
          interval: 'y',
        })
      ).to.equal('2020-08-28T02:21:34.000Z')
    })

    it('provides correct value for simple monthly interval', function () {
      clock.tick(new Date('2021-03-31T02:21:34.000Z').getTime())
      expect(
        GitHubCommitActivity.getIntervalQueryStartDate({
          interval: 'm',
        })
      ).to.equal('2021-03-01T02:21:34.000Z')
    })

    it('provides correct value for fun monthly interval', function () {
      clock.tick(new Date('2021-03-07T02:21:34.000Z').getTime())
      expect(
        GitHubCommitActivity.getIntervalQueryStartDate({
          interval: '4w',
        })
      ).to.equal('2021-02-05T02:21:34.000Z')
    })

    it('provides correct value for weekly interval', function () {
      clock.tick(new Date('2021-12-31T23:59:34.000Z').getTime())
      expect(
        GitHubCommitActivity.getIntervalQueryStartDate({
          interval: 'w',
        })
      ).to.equal('2021-12-24T23:59:34.000Z')
    })
  })
})
