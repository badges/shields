import { redirector } from '../index.js'

export default [
  redirector({
    name: 'CoverallsGitHubRedirect',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':user((?!github|bitbucket).*)/:repo/:branch*',
    },
    transformPath: ({ user, repo, branch }) =>
      `/coverallsCoverage/github/${user}/${repo}${branch ? `/${branch}` : ''}`,
    dateAdded: new Date('2021-02-23'),
  }),
  redirector({
    name: 'CoverallsPreGitlabRedirect',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':vcsType(github|bitbucket|gitlab)/:user/:repo/:branch*',
    },
    transformPath: ({ user, repo, branch }) =>
      `/coverallsCoverage/github/${user}/${repo}${branch ? `/${branch}` : ''}`,
    dateAdded: new Date('2022-10-30'),
  }),
]
