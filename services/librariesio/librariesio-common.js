'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger, anyInteger } = require('../validators')

// API doc: https://libraries.io/api#project
const projectSchema = Joi.object({
  platform: Joi.string().required(),
  dependents_count: nonNegativeInteger,
  dependent_repos_count: nonNegativeInteger,
  rank: anyInteger,
}).required()

async function fetchProject(serviceInstance, { platform, packageName }) {
  return serviceInstance._requestJson({
    schema: projectSchema,
    url: `https://libraries.io/api/${platform}/${packageName}`,
    errorMessages: { 404: 'package not found' },
  })
}

module.exports = {
  fetchProject,
}
