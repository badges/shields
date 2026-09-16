import { retiredService } from '../index.js'

const commonProps = {
  category: 'build',
  label: 'jenkins',
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
}

export default [
  retiredService({
    route: {
      base: 'jenkins-ci/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  retiredService({
    route: {
      base: 'jenkins/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  retiredService({
    route: {
      base: 'jenkins/build',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
]
