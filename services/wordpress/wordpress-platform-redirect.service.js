'use strict'

const { redirector } = require('..')

module.exports = redirector({
  category: 'platform-support',
  route: {
    base: 'wordpress/v',
    pattern: ':slug',
  },
  transformPath: ({ slug }) => `/wordpress/plugin/wp-version/${slug}`,
  dateAdded: new Date('2019-04-17'),
})
