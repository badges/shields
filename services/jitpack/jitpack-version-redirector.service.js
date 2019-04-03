'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'version',
    route: {
      base: 'jitpack/v',
      pattern: ':groupId/:artifactId',
    },
    transformPath: ({ groupId, artifactId }) =>
      `/jitpack/v/github/${groupId}/${artifactId}`,
    dateAdded: new Date('2019-03-31'),
  }),
]
