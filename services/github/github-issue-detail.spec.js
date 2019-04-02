'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const { InvalidResponse } = require('..')
const GithubIssueDetail = require('./github-issue-detail.service')
const { stateColor } = require('./github-helpers')

describe('GithubIssueDetail', function() {
  test(GithubIssueDetail.render, () => {
    given({
      which: 'state',
      value: 'open',
      json: { pull_request: {}, number: 12 },
    }).expect({
      label: 'pull request 12',
      message: 'open',
      color: stateColor('open'),
    })
    given({ which: 'state', value: 'closed', json: { number: 15 } }).expect({
      label: 'issue 15',
      message: 'closed',
      color: stateColor('closed'),
    })
    given({
      which: 'label',
      value: 'feature',
      json: { labels: [{ name: 'feature', color: 'a2eeef' }] },
    }).expect({
      color: 'a2eeef',
      message: 'feature',
      label: 'label',
    })
    given({
      which: 'label',
      value: 'service-badge | bug',
      json: {
        labels: [
          { name: 'service-badge', color: 'a2eeef' },
          { name: 'bug', color: 'ee0701' },
        ],
      },
    }).expect({
      color: undefined,
      message: 'service-badge | bug',
      label: 'label',
    })
  })

  test(GithubIssueDetail.prototype.transform, () => {
    given({
      which: 'label',
      json: {
        labels: [
          { name: 'service-badge', color: 'a2eeef' },
          { name: 'bug', color: 'ee0701' },
        ],
      },
    }).expect({
      value: 'service-badge | bug',
    })
    given({
      which: 'label',
      json: { labels: [{ name: 'bug', color: 'ee0701' }] },
    }).expect({
      value: 'bug',
    })
  })

  context('transform()', function() {
    it('throws InvalidResponse error when issue has no labels', function() {
      try {
        GithubIssueDetail.prototype.transform({
          which: 'label',
          json: { labels: [] },
        })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.prettyMessage).to.equal('no labels found')
      }
    })
  })
})
