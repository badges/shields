import { redirector } from '../index.js'

export default [
  redirector({
    name: 'NpmsIOScoreRedirectWithScope',
    category: 'analysis',
    route: {
      base: 'npms-io',
      pattern:
        ':type(final|maintenance|popularity|quality)-score/:scope(@.+)/:packageName',
    },
    transformPath: ({ type, scope, packageName }) =>
      `/npms-io/score/${type}/${scope}/${packageName}`,
    dateAdded: new Date('2023-02-27'),
  }),
  redirector({
    name: 'NpmsIOScoreRedirectWithoutScope',
    category: 'analysis',
    route: {
      base: 'npms-io',
      pattern: ':type(final|maintenance|popularity|quality)-score/:packageName',
    },
    transformPath: ({ type, packageName }) =>
      `/npms-io/score/${type}/${packageName}`,
    dateAdded: new Date('2023-02-27'),
  }),
]
