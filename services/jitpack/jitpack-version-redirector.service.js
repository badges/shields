import { deprecatedService, redirector } from '../index.js'

export default [
  deprecatedService({
    category: 'version',
    label: 'jitpack',
    name: 'JitpackVersionGitHubRedirect',
    route: {
      base: 'jitpack/v',
      pattern: ':user/:repo',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
  redirector({
    category: 'version',
    name: 'JitpackVersionVcsRedirect',
    route: {
      base: 'jitpack/v',
      pattern: ':vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
    },
    transformPath: ({ vcs, user, repo }) =>
      `/jitpack/version/com.${vcs}.${user}/${repo}`,
    dateAdded: new Date('2022-08-21'),
  }),
]
