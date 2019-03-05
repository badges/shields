'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'vso/build',
      pattern: ':organization/:projectId/:definitionId/:branch*',
    },
    transformPath: ({ organization, projectId, definitionId, branch }) => {
      let path = `/azure-devops/build/${organization}/${projectId}/${definitionId}`
      if (branch) {
        path += `/${branch}`
      }
      return path
    },
    dateAdded: new Date('2019-02-08'),
  }),
  redirector({
    category: 'build',
    route: {
      base: 'vso/release',
      pattern: ':organization/:projectId/:definitionId/:environmentId',
    },
    transformPath: ({ organization, projectId, definitionId, environmentId }) =>
      `/azure-devops/release/${organization}/${projectId}/${definitionId}/${environmentId}`,
    dateAdded: new Date('2019-02-08'),
  }),
]
