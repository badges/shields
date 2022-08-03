import { test, given } from 'sazerac'
import GitlabMergeRequests from './gitlab-merge-requests.service.js'

describe('GitlabMergeRequests', function () {
  test(GitlabMergeRequests.render, () => {
    given({ variant: 'open', mergeRequestCount: 1399 }).expect({
      label: 'merge requests',
      message: '1.4k open',
      color: 'brightgreen',
    })
    given({ variant: 'open', raw: '-raw', mergeRequestCount: 1399 }).expect({
      label: 'open merge requests',
      message: '1.4k',
      color: 'brightgreen',
    })
    given({
      variant: 'open',
      labels: 'discussion,enhancement',
      mergeRequestCount: 15,
    }).expect({
      label: 'discussion,enhancement merge requests',
      message: '15 open',
      color: 'brightgreen',
    })
    given({ variant: 'open', mergeRequestCount: 0 }).expect({
      label: 'merge requests',
      message: '0 open',
      color: 'blue',
    })
    given({ variant: 'open', mergeRequestCount: 10001 }).expect({
      label: 'merge requests',
      message: 'more than 10k open',
      color: 'brightgreen',
    })
  })
})
