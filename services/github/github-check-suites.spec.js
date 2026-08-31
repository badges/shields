import { test, given } from 'sazerac'
import GithubCheckSuites from './github-check-suites.service.js'

describe('GithubCheckSuites.transform', function () {
  test(GithubCheckSuites.transform, () => {
    given({
      check_suites: [
        {
          status: 'completed',
          conclusion: 'success',
          latest_check_runs_count: 27,
        },
        {
          status: 'completed',
          conclusion: 'success',
          latest_check_runs_count: 6,
        },
        {
          status: 'queued',
          conclusion: null,
          latest_check_runs_count: 0,
        },
      ],
    }).expect({
      total: 2,
      statusCounts: { completed: 2 },
      conclusionCounts: { success: 2 },
    })
  })
})

describe('GithubCheckSuites', function () {
  test(GithubCheckSuites.mapState, () => {
    given({
      total: 0,
      statusCounts: null,
      conclusionCounts: null,
    }).expect('no check suites')
    given({
      total: 1,
      statusCounts: { queued: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { requested: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { waiting: 1 },
      conclusionCounts: null,
    }).expect('queued')
    given({
      total: 1,
      statusCounts: { in_progress: 1 },
      conclusionCounts: null,
    }).expect('pending')
    given({
      total: 1,
      statusCounts: { pending: 1 },
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
      conclusionCounts: { success: 1, stale: 1, startup_failure: 1 },
    }).expect('failing')
    given({
      total: 1,
      statusCounts: { somethingelse: 1 },
      conclusionCounts: null,
    }).expect('unknown status')
  })
})
