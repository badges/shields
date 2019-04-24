'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'jenkins/t',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    transformPath: ({ protocol, host, job }) =>
      `/jenkins/tests/${protocol}/${host}/${job}`,
    dateAdded: new Date('2019-04-20'),
  }),
]
