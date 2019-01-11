'use strict'

const Joi = require('joi')

const categories = [
  { id: 'build', name: 'Build' },
  { id: 'coverage', name: 'Code Coverage' },
  { id: 'analysis', name: 'Analysis' },
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
  { id: 'activity', name: 'Activity' },
  { id: 'other', name: 'Other' },
]

const isRealCategory = Joi.equal(categories.map(({ id }) => id)).required()

const isValidCategory = Joi.alternatives()
  .try(isRealCategory, Joi.equal('debug', 'dynamic').required())
  .required()

function assertValidCategory(category, message = undefined) {
  Joi.assert(category, isValidCategory, message)
}

module.exports = {
  categories,
  assertValidCategory,
}
