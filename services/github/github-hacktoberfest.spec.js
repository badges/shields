import { test, given } from 'sazerac'
import GitHubHacktoberfest from './github-hacktoberfest.service.js'

describe('GitHubHacktoberfest', function () {
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
    given({
      daysToStart: 5,
      hasStarted: false,
      year: 2020,
    }).expect({
      message: '5 days till kickoff!',
    })
  })
})
