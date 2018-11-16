'use strict'

const Joi = require('joi')
const serverSecrets = require('../../lib/server-secrets')

const schema = Joi.object({
  message: Joi.equal(
    'succeeded',
    'partially suceeded',
    'failed',
    'unknown',
    'set up now'
  ).required(),
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

function render({ status }) {
  switch (status) {
    case 'succeeded':
      return {
        message: 'passing',
        color: 'brightgreen',
      }
    case 'partially succeeded':
      return {
        message: 'passing',
        color: 'orange',
      }
    case 'failed':
      return {
        message: 'failing',
        color: 'red',
      }
  }
}

function buildOptions() {
  const options = {}
  if (serverSecrets && serverSecrets.azure_devops_token) {
    const pat = serverSecrets.azure_devops_token
    const auth = Buffer.from(`:${pat}`).toString('base64')
    options.headers = {
      Authorization: `basic ${auth}`,
    }
  }
  return options
}

module.exports = { fetch, render, buildOptions }
