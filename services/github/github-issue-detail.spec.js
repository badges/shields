import { expect } from 'chai'
import { test, given } from 'sazerac'
import { age } from '../color-formatters.js'
import { formatDate, metric } from '../text-formatters.js'
import { InvalidResponse } from '../index.js'
import GithubIssueDetail from './github-issue-detail.service.js'
import { issueStateColor, commentsColor } from './github-helpers.js'

describe('GithubIssueDetail', function () {
  test(GithubIssueDetail.render, () => {
    given({
      property: 'state',
      value: { state: 'open' },
      number: '12',
      isPR: true,
    }).expect({
      label: 'pull request 12',
      message: 'open',
      color: issueStateColor('open'),
    })
    given({
      property: 'state',
      value: { state: 'closed' },
      number: '15',
      isPR: false,
    }).expect({
      label: 'issue 15',
      message: 'closed',
      color: issueStateColor('closed'),
    })
    given({
      property: 'title',
      value: 'refactor [FooService]',
      number: '232',
      isPR: true,
    }).expect({
      label: 'pull request 232',
      message: 'refactor [FooService]',
    })
    given({
      property: 'title',
      value: 'Packagist: invalid response data',
      number: '345',
      isPR: false,
    }).expect({
      label: 'issue 345',
      message: 'Packagist: invalid response data',
    })
    given({
      property: 'author',
      value: 'calebcartwright',
    }).expect({
      label: 'author',
      message: 'calebcartwright',
    })
    given({
      property: 'label',
      value: { names: ['feature'], colors: ['a2eeef'] },
    }).expect({
      color: 'a2eeef',
      message: 'feature',
      label: 'label',
    })
    given({
      property: 'label',
      value: { names: ['service-badge', 'bug'], colors: ['a2eeef', 'ee0701'] },
    }).expect({
      color: undefined,
      message: 'service-badge | bug',
      label: 'label',
    })
    given({ property: 'comments', value: 27 }).expect({
      label: 'comments',
      message: metric(27),
      color: commentsColor('closed'),
    })
    given({
      property: 'age',
      value: '2019-04-01T20:09:31Z',
    }).expect({
      label: 'created',
      message: formatDate('2019-04-01T20:09:31Z'),
      color: age('2019-04-01T20:09:31Z'),
    })
    given({
      property: 'last-update',
      value: '2019-04-02T20:09:31Z',
    }).expect({
      label: 'updated',
      message: formatDate('2019-04-02T20:09:31Z'),
      color: age('2019-04-02T20:09:31Z'),
    })
  })

  test(GithubIssueDetail.prototype.transform, () => {
    given({
      property: 'state',
      json: { state: 'closed' },
    }).expect({
      // Since it's a PR, the "merged" value is not crucial here.
      value: { state: 'closed', merged: true },
      isPR: false,
    })
    given({
      property: 'state',
      issueKind: 'pulls',
      json: { state: 'closed', merged_at: null },
    }).expect({
      value: { state: 'closed', merged: false },
      isPR: true,
    })
    given({
      property: 'state',
      issueKind: 'pulls',
      json: { state: 'closed', merged_at: 'I am not null' },
    }).expect({
      value: { state: 'closed', merged: true },
      isPR: true,
    })
    given({
      property: 'title',
      json: { pull_request: {}, title: 'refactor [Codecov]' },
    }).expect({
      value: 'refactor [Codecov]',
      isPR: true,
    })
    given({
      property: 'author',
      json: { user: { login: 'dependabot' } },
    }).expect({
      value: 'dependabot',
      isPR: false,
    })
    given({
      property: 'label',
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
      property: 'label',
      json: { labels: [{ name: 'bug', color: 'ee0701' }] },
    }).expect({
      value: {
        names: ['bug'],
        colors: ['ee0701'],
      },
      isPR: false,
    })
    given({
      property: 'comments',
      json: { comments: 100 },
    }).expect({
      value: 100,
      isPR: false,
    })
    given({
      property: 'age',
      json: { created_at: '2019-04-01T20:09:31Z' },
    }).expect({
      value: '2019-04-01T20:09:31Z',
      isPR: false,
    })
    given({
      property: 'last-update',
      json: { updated_at: '2019-04-02T20:09:31Z' },
    }).expect({
      value: '2019-04-02T20:09:31Z',
      isPR: false,
    })
  })

  context('transform()', function () {
    it('throws InvalidResponse error when issue has no labels', function () {
      try {
        GithubIssueDetail.prototype.transform({
          property: 'label',
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
