'use strict'

const { redirector } = require('..')

module.exports = [
  redirector({
    name: 'BugzillaRedirect',
    category: 'issue-tracking',
    route: {
      base: 'bugzilla',
      pattern: ':bugNumber',
    },
    transformPath: ({ bugNumber }) =>
      `/https/bugzilla.mozilla.org/${bugNumber}`,
    dateAdded: new Date('2019-07-01'),
  }),
]
