'use strict'

const { redirector } = require('..')

module.exports = [
  // The WaffleLabel service originally had 'label' as an optional parameter
  // with a default value of 'ready'. However, after some discussion it was
  // agreed that 'ready' didn't make sense as a default, nor was there any other
  // value that would be a reasonable default. As such, 'label' is now a required
  // param and this redirect service maintains backwards compatibility.
  // See https://github.com/badges/shields/pull/3133#discussion_r261882687
  redirector({
    category: 'issue-tracking',
    route: {
      base: 'waffle/label',
      pattern: ':user/:repo',
    },
    transformPath: ({ user, repo }) => `/waffle/label/${user}/${repo}/ready`,
    dateAdded: new Date('2019-03-05'),
  }),
]
