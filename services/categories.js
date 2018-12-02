'use strict'

const Joi = require('joi')

const categories = [
  { id: 'build', name: 'Build' },
  { id: 'chat', name: 'Chat' },
  { id: 'dependencies', name: 'Dependencies' },
  { id: 'size', name: 'Size' },
  { id: 'downloads', name: 'Downloads' },
  { id: 'funding', name: 'Funding' },
  { id: 'issue-tracking', name: 'Issue Tracking' },
  { id: 'license', name: 'License' },
  { id: 'rating', name: 'Rating' },
  { id: 'social', name: 'Social' },
  { id: 'version', name: 'Version' },
  { id: 'platform-support', name: 'Platform & Version Support' },
  { id: 'monitoring', name: 'Monitoring' },
  { id: 'other', name: 'Other' },
]

const isValidCategory = Joi.equal(categories.map(({ id }) => id)).required()

function assertValidCategory(category, message = undefined) {
  Joi.assert(category, isValidCategory, message)
}

module.exports = {
  categories,
  isValidCategory,
  assertValidCategory,
}
