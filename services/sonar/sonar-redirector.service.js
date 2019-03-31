'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    category: 'analysis',
    route: {
      base: 'sonar',
      pattern:
        ':version/:protocol(http|https)/:host(.+)/:component(.+)/:metric',
    },
    transformPath: ({ protocol, host, component, metric }) =>
      `sonar/${protocol}/${host}/${component}/${metric}`,
    transformQueryParams: ({ version }) => ({ version }),
    dateAdded: new Date('2019-04-02'),
  }),
]
