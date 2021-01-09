'use strict'

const { test, given } = require('sazerac')
const {
  renderContributorBadge,
  renderContributorBadgeWithLink,
} = require('./contributor-count')

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

  test(renderContributorBadgeWithLink, () => {
    given({
      label: 'maintainers',
      contributorCount: 1,
      link: 'https://github.com/badges/shields',
    }).expect({
      label: 'maintainers',
      message: '1',
      color: 'red',
      link: 'https://github.com/badges/shields',
    })
    given({
      label: 'collaborators',
      contributorCount: 3000,
      link: 'https://github.com/badges/shields',
    }).expect({
      label: 'collaborators',
      message: '3k',
      color: 'brightgreen',
      link: 'https://github.com/badges/shields',
    })
  })
})
