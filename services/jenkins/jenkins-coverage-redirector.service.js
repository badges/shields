'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'coverage',
  route: {
    base: 'jenkins',
    pattern: ':coverageFormat(j|c)/:protocol(http|https)/:host/:job+',
  },
  transformPath: ({ coverageFormat, protocol, host, job }) =>
    `/jenkins/coverage/${
      coverageFormat === 'j' ? 'jacoco' : 'cobertura'
    }/${protocol}/${host}/${job}`,
  dateAdded: new Date('2019-04-20'),
})
