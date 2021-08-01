import { redirector } from '../index.js'
import { buildRedirectUrl } from './jenkins-common.js'

const commonProps = {
  category: 'build',
  transformPath: () => '/jenkins/build',
  transformQueryParams: ({ protocol, host, job }) => ({
    jobUrl: buildRedirectUrl({ protocol, host, job }),
  }),
}

export default [
  redirector({
    route: {
      base: 'jenkins-ci/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    dateAdded: new Date('2019-04-20'),
    ...commonProps,
  }),
  redirector({
    route: {
      base: 'jenkins/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    dateAdded: new Date('2019-04-20'),
    ...commonProps,
  }),
  redirector({
    route: {
      base: 'jenkins/build',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    dateAdded: new Date('2019-11-29'),
    ...commonProps,
  }),
]
