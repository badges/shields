import { redirector } from '../index.js'

export default [
  redirector({
    name: 'SonarVersionPrefixRedirector',
    category: 'analysis',
    route: {
      base: 'sonar',
      pattern:
        ':sonarVersion/:protocol(http|https)/:host(.+)/:component(.+)/:metric',
    },
    transformPath: ({ protocol, host, component, metric }) =>
      `/sonar/${metric}/${component}`,
    transformQueryParams: ({ protocol, host, sonarVersion }) => ({
      server: `${protocol}://${host}`,
      sonarVersion,
    }),
    dateAdded: new Date('2019-07-05'),
  }),
  redirector({
    name: 'SonarServerRedirector',
    category: 'coverage',
    route: {
      base: 'sonar',
      pattern: ':protocol(http|https)/:host(.+)/:component(.+)/:metric',
    },
    transformPath: ({ component, metric }) => `/sonar/${metric}/${component}`,
    transformQueryParams: ({ protocol, host }) => ({
      server: `${protocol}://${host}`,
    }),
    dateAdded: new Date('2019-07-05'),
  }),
]
