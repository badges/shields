'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'jenkins-ci/s',
      pattern: ':protocol(http|https)/:host+/:job+',
    },
    transformPath: ({ protocol, host, job }) =>
      `/jenkins/build/${protocol}/${host}/${job}`,
    dateAdded: new Date('2019-04-20'),
  }),
  redirector({
    category: 'build',
    route: {
      base: 'jenkins/s',
      pattern: ':protocol(http|https)/:host+/:job+',
    },
    transformPath: ({ protocol, host, job }) =>
      `/jenkins/build/${protocol}/${host}/${job}`,
    dateAdded: new Date('2019-04-20'),
  }),
]
