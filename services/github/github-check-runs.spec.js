import { test, given } from 'sazerac'
import GithubCheckRuns from './github-check-runs.service.js'

describe('GithubCheckRuns', function () {
  test(GithubCheckRuns.mapState, () => {
    given({
      total: 0,
      statusCounts: null,
      conclusionCounts: null,
    }).expect('no check runs')
    given({
      total: 1,
      statusCounts: { queued: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { in_progress: 1 },
      conclusionCounts: null,
    }).expect('pending')
    given({
      total: 1,
      statusCounts: { completed: 1 },
      conclusionCounts: { success: 1 },
    }).expect('passing')
    given({
      total: 2,
      statusCounts: { completed: 2 },
      conclusionCounts: { success: 1, stale: 1 },
    }).expect('partially succeeded')
    given({
      total: 3,
      statusCounts: { completed: 3 },
      conclusionCounts: { success: 1, stale: 1, failure: 1 },
    }).expect('failing')
    given({
      total: 1,
      statusCounts: { somethingelse: 1 },
      conclusionCounts: null,
    }).expect('unknown status')
  })
})
