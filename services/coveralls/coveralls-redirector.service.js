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
      `/coveralls/github/${user}/${repo}${branch ? `/${branch}` : ''}`,
    dateAdded: new Date('2021-02-23'),
  }),
]
