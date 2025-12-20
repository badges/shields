import { deprecatedService } from '../index.js'

const commonProps = {
  category: 'coverage',
  label: 'jenkins',
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
}

export default [
  deprecatedService({
    route: {
      base: 'jenkins',
      pattern: ':coverageFormat(j|c)/:protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  deprecatedService({
    route: {
      base: 'jenkins/coverage',
      pattern:
        ':coverageFormat(jacoco|cobertura|api)/:protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  deprecatedService({
    route: {
      base: 'jenkins/coverage/api',
      pattern: '',
    },
    ...commonProps,
  }),
]
