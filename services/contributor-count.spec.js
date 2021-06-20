import { test, given } from 'sazerac'
import { renderContributorBadge } from './contributor-count.js'

describe('Contributor count helpers', function () {
  test(renderContributorBadge, () => {
    given({ label: 'maintainers', contributorCount: 1 }).expect({
      label: 'maintainers',
      message: '1',
      color: 'red',
    })
    given({ label: 'collaborators', contributorCount: 2 }).expect({
      label: 'collaborators',
      message: '2',
      color: 'yellow',
    })
    given({ label: 'collaborators', contributorCount: 3000 }).expect({
      label: 'collaborators',
      message: '3k',
      color: 'brightgreen',
    })
  })
})
