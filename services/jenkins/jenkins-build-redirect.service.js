'use strict'

const { buildRedirectUrl } = require('./jenkins-common')
const { redirector } = require('..')

const commonProps = {
  category: 'build',
  transformPath: () => '/jenkins/build',
  transformQueryParams: ({ protocol, host, job }) => ({
    jobUrl: buildRedirectUrl({ protocol, host, job }),
  }),
}

module.exports = [
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
