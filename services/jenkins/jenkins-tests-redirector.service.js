import { deprecatedService } from '../index.js'

const commonProps = {
  category: 'build',
  label: 'jenkins',
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
}

export default [
  deprecatedService({
    route: {
      base: 'jenkins/t',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  deprecatedService({
    route: {
      base: 'jenkins/tests',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
]
