'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'jenkins-ci',
      pattern: 's/:protocol(http|https)/:host+/:job+',
    },
    transformPath: ({ protocol, host, job }) =>
      `/jenkins/s/${protocol}/${host}/${job}`,
    dateAdded: new Date('2019-04-14'),
  }),
]
