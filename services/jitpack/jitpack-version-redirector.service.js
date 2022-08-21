import { redirector } from '../index.js'

export default [
  redirector({
    category: 'version',
    route: {
      base: 'jitpack/v',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) =>
      `/jitpack/version/com.github.${user}/${repo}`,
    dateAdded: new Date('2019-03-31'),
  }),
  redirector({
    category: 'version',
    route: {
      base: 'jitpack/v',
      pattern: ':vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
    },
    transformPath: ({ vcs, user, repo }) =>
      `/jitpack/version/com.${vcs}.${user}/${repo}`,
    dateAdded: new Date('2022-08-21'),
  }),
]
