'use strict'

const { redirector } = require('..')

const vcsSNameShortFormMap = {
  bb: 'bitbucket',
  gh: 'github',
  gl: 'gitlab',
}

module.exports = [
  redirector({
    category: 'coverage',
    route: {
      base: 'codecov/c',
      pattern:
        'token/:token/:vcsName(github|gh|bitbucket|bb|gl|gitlab)/:user/:repo/:branch*',
    },
    transformPath: ({ vcsName, user, repo, branch }) => {
      const vcs = vcsSNameShortFormMap[vcsName] || vcsName
      return `/codecov/c/${vcs}/${user}/${repo}${branch ? `/${branch}` : ''}`
    },
    transformQueryParams: ({ token }) => ({ token }),
    dateAdded: new Date('2019-03-04'),
  }),
]
