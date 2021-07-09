import { redirector } from '../index.js'

const commonAttrs = {
  category: 'analysis',
  dateAdded: new Date('2019-04-30'),
}

export default [
  redirector({
    route: {
      base: 'lgtm/alerts/g',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/lgtm/alerts/github/${user}/${repo}`,
    ...commonAttrs,
  }),
  redirector({
    route: {
      base: 'lgtm/grade',
      pattern: ':language/g/:user/:repo',
    },
    transformPath: ({ language, user, repo }) =>
      `/lgtm/grade/${language}/github/${user}/${repo}`,
    ...commonAttrs,
  }),
]
