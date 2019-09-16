'use strict'

const { redirector } = require('..')

const commonAttrs = {
  dateAdded: new Date('2019-09-15'),
  category: 'build',
}

module.exports = [
  redirector({
    ...commonAttrs,
    name: 'TeamCityBuildLegacyCodeBetterRedirect',
    route: {
      base: 'teamcity/codebetter',
      pattern: ':buildId',
    },
    transformPath: ({ buildId }) => `/teamcity/build/s/${buildId}`,
    transformQueryParams: _params => ({
      server: 'https://teamcity.jetbrains.com',
    }),
  }),
  redirector({
    ...commonAttrs,
    name: 'TeamCityBuildRedirect',
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
  }),
]
