'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')
const { isBuildStatus } = require('../../lib/build-status')

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

function getHeaders() {
  const headers = {}
  if (serverSecrets.azure_devops_token) {
    const pat = serverSecrets.azure_devops_token
    const auth = Buffer.from(`:${pat}`).toString('base64')
    headers.Authorization = `basic ${auth}`
  }

  return headers
}

module.exports = { keywords, fetch, getHeaders }
