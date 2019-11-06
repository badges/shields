'use strict'

const { test, given } = require('sazerac')
const GitHubHacktoberfest = require('./github-hacktoberfest.service')

describe('GitHubHacktoberfest', function() {
  test(GitHubHacktoberfest.render, () => {
    given({
      daysLeft: -1,
      contributionCount: 12,
    }).expect({
      message: 'is over! (12 PRs opened)',
    })
    given({
      daysLeft: 10,
      contributionCount: 27,
      suggestedIssueCount: 54,
    }).expect({
      message: '54 open issues, 27 PRs, 10 days left',
    })
  })
})
