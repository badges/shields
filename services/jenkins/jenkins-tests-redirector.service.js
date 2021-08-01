import { redirector } from '../index.js'
import { buildRedirectUrl } from './jenkins-common.js'

const commonProps = {
  category: 'build',
  transformPath: () => '/jenkins/tests',
  transformQueryParams: ({ protocol, host, job }) => ({
    jobUrl: buildRedirectUrl({ protocol, host, job }),
  }),
}

export default [
  redirector({
    route: {
      base: 'jenkins/t',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    dateAdded: new Date('2019-04-20'),
    ...commonProps,
  }),
  redirector({
    route: {
      base: 'jenkins/tests',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    dateAdded: new Date('2019-11-29'),
    ...commonProps,
  }),
]
