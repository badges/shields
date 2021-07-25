import { redirector } from '../index.js'
import { buildRedirectUrl } from './jenkins-common.js'

const commonProps = {
  category: 'coverage',
  transformQueryParams: ({ protocol, host, job }) => ({
    jobUrl: buildRedirectUrl({ protocol, host, job }),
  }),
}

export default [
  redirector({
    route: {
      base: 'jenkins',
      pattern: ':coverageFormat(j|c)/:protocol(http|https)/:host/:job+',
    },
    transformPath: ({ coverageFormat }) =>
      `/jenkins/coverage/${coverageFormat === 'j' ? 'jacoco' : 'cobertura'}`,
    dateAdded: new Date('2019-04-20'),
    ...commonProps,
  }),
  redirector({
    route: {
      base: 'jenkins/coverage',
      pattern:
        ':coverageFormat(jacoco|cobertura|api)/:protocol(http|https)/:host/:job+',
    },
    transformPath: ({ coverageFormat }) =>
      `/jenkins/coverage/${coverageFormat}`,
    dateAdded: new Date('2019-11-29'),
    ...commonProps,
  }),
]
