'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const { InvalidResponse } = require('..')
const { age } = require('../color-formatters')
const { formatDate, metric } = require('../text-formatters')
const GithubIssueDetail = require('./github-issue-detail.service')
const { stateColor, commentsColor } = require('./github-helpers')

describe('GithubIssueDetail', function() {
  test(GithubIssueDetail.render, () => {
    given({
      which: 'state',
      value: 'open',
      number: '12',
      isPR: true,
    }).expect({
      label: 'pull request 12',
      message: 'open',
      color: stateColor('open'),
    })
    given({
      which: 'state',
      value: 'closed',
      number: '15',
      isPR: false,
    }).expect({
      label: 'issue 15',
      message: 'closed',
      color: stateColor('closed'),
    })
    given({
      which: 'title',
      value: 'refactor [FooService]',
      number: '232',
      isPR: true,
    }).expect({
      label: 'pull request 232',
      message: 'refactor [FooService]',
    })
    given({
      which: 'title',
      value: 'Packagist: invalid response data',
      number: '345',
      isPR: false,
    }).expect({
      label: 'issue 345',
      message: 'Packagist: invalid response data',
    })
    given({
      which: 'author',
      value: 'calebcartwright',
    }).expect({
      label: 'author',
      message: 'calebcartwright',
    })
    given({
      which: 'label',
      value: { names: ['feature'], colors: ['a2eeef'] },
    }).expect({
      color: 'a2eeef',
      message: 'feature',
      label: 'label',
    })
    given({
      which: 'label',
      value: { names: ['service-badge', 'bug'], colors: ['a2eeef', 'ee0701'] },
    }).expect({
      color: undefined,
      message: 'service-badge | bug',
      label: 'label',
    })
    given({ which: 'comments', value: 27 }).expect({
      label: 'comments',
      message: metric(27),
      color: commentsColor('closed'),
    })
    given({
      which: 'age',
      value: '2019-04-01T20:09:31Z',
    }).expect({
      label: 'created',
      message: formatDate('2019-04-01T20:09:31Z'),
      color: age('2019-04-01T20:09:31Z'),
    })
    given({
      which: 'last-update',
      value: '2019-04-02T20:09:31Z',
    }).expect({
      label: 'updated',
      message: formatDate('2019-04-02T20:09:31Z'),
      color: age('2019-04-02T20:09:31Z'),
    })
  })

  test(GithubIssueDetail.prototype.transform, () => {
    given({
      which: 'state',
      json: { state: 'closed' },
    }).expect({
      value: 'closed',
      isPR: false,
    })
    given({
      which: 'title',
      json: { pull_request: {}, title: 'refactor [Codecov]' },
    }).expect({
      value: 'refactor [Codecov]',
      isPR: true,
    })
    given({
      which: 'author',
      json: { user: { login: 'dependabot' } },
    }).expect({
      value: 'dependabot',
      isPR: false,
    })
    given({
      which: 'label',
      json: {
        pull_request: {},
        labels: [
          { name: 'service-badge', color: 'a2eeef' },
          { name: 'bug', color: 'ee0701' },
        ],
      },
    }).expect({
      value: {
        names: ['service-badge', 'bug'],
        colors: ['a2eeef', 'ee0701'],
      },
      isPR: true,
    })
    given({
      which: 'label',
      json: { labels: [{ name: 'bug', color: 'ee0701' }] },
    }).expect({
      value: {
        names: ['bug'],
        colors: ['ee0701'],
      },
      isPR: false,
    })
    given({
      which: 'comments',
      json: { comments: 100 },
    }).expect({
      value: 100,
      isPR: false,
    })
    given({
      which: 'age',
      json: { created_at: '2019-04-01T20:09:31Z' },
    }).expect({
      value: '2019-04-01T20:09:31Z',
      isPR: false,
    })
    given({
      which: 'last-update',
      json: { updated_at: '2019-04-02T20:09:31Z' },
    }).expect({
      value: '2019-04-02T20:09:31Z',
      isPR: false,
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
