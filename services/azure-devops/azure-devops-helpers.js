'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const { optionalAuth } = require('../auth')

const keywords = ['vso', 'vsts', 'azure-devops']

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'), Joi.equal('set up now'))
    .required(),
}).required()

async function fetch(serviceInstance, { url, qs = {}, errorMessages }) {
  // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
  const { message: status } = await serviceInstance._requestSvg({
    schema,
    url,
    options: { qs },
    errorMessages,
  })
  return { status }
}

function auth(serviceInstance) {
  return optionalAuth(serviceInstance, { passKey: 'azure_devops_token' })
}

module.exports = { keywords, fetch, auth }
