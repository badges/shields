import { redirector } from '../index.js'

const commonAttrs = {
  category: 'analysis',
  dateAdded: new Date('2019-04-24'),
}

export default [
  redirector({
    route: {
      base: 'scrutinizer',
      pattern: ':vcs(g|b)/:user/:repo/:branch*',
    },
    transformPath: ({ vcs, user, repo, branch }) =>
      `/scrutinizer/quality/${vcs}/${user}/${repo}${
        branch ? `/${branch}` : ''
      }`,
    ...commonAttrs,
  }),
  redirector({
    route: {
      base: 'scrutinizer/gl',
      pattern: ':instance/:user/:repo/:branch*',
    },
    transformPath: ({ instance, user, repo, branch }) =>
      `/scrutinizer/quality/gl/${instance}/${user}/${repo}${
        branch ? `/${branch}` : ''
      }`,
    ...commonAttrs,
  }),
  redirector({
    route: {
      base: 'scrutinizer/gp',
      pattern: ':slug/:branch*',
    },
    transformPath: ({ slug, branch }) =>
      `/scrutinizer/quality/gp/${slug}${branch ? `/${branch}` : ''}`,
    ...commonAttrs,
  }),
]
