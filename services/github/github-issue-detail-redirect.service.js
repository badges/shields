import { redirector } from '../index.js'

const variantMap = {
  s: 'state',
  u: 'author',
}

export default [
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'github',
      pattern:
        ':issueKind(issues|pulls)/detail/:variant(s|u)/:user/:repo/:number([0-9]+)',
    },
    transformPath: ({ issueKind, variant, user, repo, number }) =>
      `/github/${issueKind}/detail/${variantMap[variant]}/${user}/${repo}/${number}`,
    dateAdded: new Date('2019-04-04'),
  }),
]
