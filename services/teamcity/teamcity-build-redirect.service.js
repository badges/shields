import { deprecatedService, redirector } from '../index.js'

export default [
  deprecatedService({
    name: 'TeamCityBuildLegacyCodeBetterRedirect',
    category: 'build',
    label: 'teamcity',
    route: {
      base: 'teamcity/codebetter',
      pattern: ':buildId',
    },
    dateAdded: new Date('2025-12-20'),
    issueUrl: 'https://github.com/badges/shields/pull/11583',
  }),
  redirector({
    name: 'TeamCityBuildRedirect',
    category: 'build',
    route: {
      base: 'teamcity',
      pattern:
        ':protocol(http|https)/:hostAndPath(.+)/:verbosity(s|e)/:buildId',
    },
    transformPath: ({ verbosity, buildId }) =>
      `/teamcity/build/${verbosity}/${buildId}`,
    transformQueryParams: ({ protocol, hostAndPath }) => ({
      server: `${protocol}://${hostAndPath}`,
    }),
    dateAdded: new Date('2019-09-15'),
  }),
]
