'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'analysis',
    route: {
      base: 'sonar',
      pattern:
        ':sonarVersion/:protocol(http|https)/:host(.+)/:component(.+)/:metric',
    },
    transformPath: ({ protocol, host, component, metric }) =>
      `/sonar/${protocol}/${host}/${component}/${metric}`,
    transformQueryParams: ({ sonarVersion }) => ({ sonarVersion }),
    dateAdded: new Date('2019-04-02'),
  }),
]
