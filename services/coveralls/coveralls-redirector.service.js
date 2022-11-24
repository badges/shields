import { redirector } from '../index.js'

export default [
  redirector({
    name: 'CoverallsGitHubRedirectWithBranch',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':user((?!github|bitbucket).*)/:repo/:branch+',
    },
    transformPath: ({ user, repo }) =>
      `/coverallsCoverage/github/${user}/${repo}`,
    transformQueryParams: ({ branch }) => ({ branch }),
    dateAdded: new Date('2022-11-10'),
  }),
  redirector({
    name: 'CoverallsGitHubRedirectWithoutBranch',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':user((?!github|bitbucket).*)/:repo',
    },
    transformPath: ({ user, repo }) =>
      `/coverallsCoverage/github/${user}/${repo}`,
    dateAdded: new Date('2021-02-23'),
  }),
  redirector({
    name: 'CoverallsPreGitlabRedirectWithBranch',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':vcsType(github|bitbucket)/:user/:repo/:branch+',
    },
    transformPath: ({ vcsType, user, repo }) =>
      `/coverallsCoverage/${vcsType}/${user}/${repo}`,
    transformQueryParams: ({ branch }) => ({ branch }),
    dateAdded: new Date('2022-11-10'),
  }),
  redirector({
    name: 'CoverallsPreGitlabRedirectWithoutBranch',
    category: 'coverage',
    route: {
      base: 'coveralls',
      pattern: ':vcsType(github|bitbucket)/:user/:repo',
    },
    transformPath: ({ vcsType, user, repo }) =>
      `/coverallsCoverage/${vcsType}/${user}/${repo}`,
    dateAdded: new Date('2022-11-20'),
  }),
]
