import { redirector, retiredService } from '../index.js'

const commonProps = {
  category: 'coverage',
  label: 'jenkins',
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
}

export default [
  retiredService({
    route: {
      base: 'jenkins',
      pattern: ':coverageFormat/:protocol/:host/*job',
    },
    ...commonProps,
  }),
  retiredService({
    route: {
      base: 'jenkins/coverage',
      pattern: ':coverageFormat/:protocol/:host/*job',
    },
    ...commonProps,
  }),
  retiredService({
    route: {
      base: 'jenkins/coverage/api',
      pattern: '',
    },
    ...commonProps,
  }),
  redirector({
    category: 'coverage',
    route: {
      base: 'jenkins/coverage',
      pattern: ':format',
    },
    routeEnum: ['jacoco', 'cobertura', 'apiv1', 'apiv4'],
    transformPath: () => '/jenkins/coverage',
    dateAdded: new Date('2026-05-17'),
  }),
]
