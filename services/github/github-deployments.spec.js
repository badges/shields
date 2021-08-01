import { test, given } from 'sazerac'
import GithubDeployments from './github-deployments.service.js'

describe('GithubDeployments', function () {
  test(GithubDeployments.render, () => {
    given({
      state: 'SUCCESS',
    }).expect({
      message: 'success',
      color: 'brightgreen',
    })
    given({
      state: 'ERROR',
    }).expect({
      message: 'error',
      color: 'red',
    })
    given({
      state: 'IN_PROGRESS',
    }).expect({
      message: 'in progress',
      color: undefined,
    })
    given({
      state: 'NO_STATUS',
    }).expect({
      message: 'no status yet',
      color: undefined,
    })
  })

  test(GithubDeployments.prototype.transform, () => {
    given({
      data: {
        repository: {
          deployments: {
            nodes: [],
          },
        },
      },
    }).expectError('Not Found: environment not found')
    given({
      data: {
        repository: {
          deployments: {
            nodes: [
              {
                latestStatus: null,
              },
            ],
          },
        },
      },
    }).expect({
      state: 'NO_STATUS',
    })
    given({
      data: {
        repository: {
          deployments: {
            nodes: [
              {
                latestStatus: {
                  state: 'SUCCESS',
                },
              },
            ],
          },
        },
      },
    }).expect({
      state: 'SUCCESS',
    })
  })
})
