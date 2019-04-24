'use strict'

const { redirector } = require('..')

const transformPath = ({ protocol, host, job }) =>
  `/jenkins/build/${protocol}/${host}/${job}`

const commonProps = {
  category: 'build',
  transformPath,
  dateAdded: new Date('2019-04-20'),
}

module.exports = [
  redirector({
    route: {
      base: 'jenkins-ci/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
  redirector({
    route: {
      base: 'jenkins/s',
      pattern: ':protocol(http|https)/:host/:job+',
    },
    ...commonProps,
  }),
]
