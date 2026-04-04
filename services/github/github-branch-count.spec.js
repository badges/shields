import { test, given } from 'sazerac'
import GithubBranchCount from './github-branch-count.service.js'

describe('GithubBranchCount', function () {
  test(GithubBranchCount.render, () => {
    given({ count: 5 }).expect({
      label: 'branches',
      message: '5',
      color: 'blue',
    })

    given({ count: 0 }).expect({
      label: 'branches',
      message: '0',
      color: 'blue',
    })

    given({ count: 1000 }).expect({
      label: 'branches',
      message: '1k',
      color: 'blue',
    })
  })
})
