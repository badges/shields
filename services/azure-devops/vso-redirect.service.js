'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'build',
    route: {
      base: 'vso/build',
      format: '([^/]+)/([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['organization', 'projectId', 'definitionId', 'branch'],
    },
    target: ({ organization, projectId, definitionId, branch }) => {
      let path = `/azure-devops/build/${organization}/${projectId}/${definitionId}`
      if (branch) {
        path += `/${branch}`
      }
      return path
    },
  }),
  redirector({
    category: 'build',
    route: {
      base: 'vso/release',
      pattern: ':organization/:projectId/:definitionId/:environmentId',
    },
    target: ({ organization, projectId, definitionId, environmentId }) =>
      `/azure-devops/release/${organization}/${projectId}/${definitionId}/${environmentId}`,
  }),
]
