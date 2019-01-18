'use strict'

const Joi = require('joi')
const { InvalidResponse } = require('../errors')
const { errorMessagesFor } = require('./github-helpers')

const issueSchema = Joi.object({
  head: Joi.object({
    sha: Joi.string().required(),
  }).required(),
}).required()

async function fetchIssue(serviceInstance, { user, repo, number }) {
  return serviceInstance._requestJson({
    schema: issueSchema,
    url: `/repos/${user}/${repo}/pulls/${number}`,
    errorMessages: errorMessagesFor('pull request or repo not found'),
  })
}

const contentSchema = Joi.object({
  // https://github.com/hapijs/joi/issues/1430
  content: Joi.string().required(),
  encoding: Joi.equal('base64').required(),
}).required()

async function fetchJsonFromRepo(
  serviceInstance,
  { schema, user, repo, branch = 'master', filename }
) {
  let url, options
  if (serviceInstance.staticAuthConfigured) {
    url = `/repos/${user}/${repo}/contents/${filename}`
    options = { qs: { ref: branch } }
  } else {
    url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filename}`
  }

  const { content } = await serviceInstance._requestJson({
    schema: contentSchema,
    url,
    options,
    errorMessages: errorMessagesFor(
      `repo not found, branch not found, or ${filename} missing`
    ),
  })

  let decoded
  try {
    decoded = Buffer.from(content, 'base64').toString('utf-8')
  } catch (e) {
    throw InvalidResponse({ prettyMessage: 'undecodable content' })
  }
  const json = serviceInstance._parseJson(decoded)
  return serviceInstance.constructor._validate(json, schema)
}

module.exports = {
  fetchIssue,
  fetchJsonFromRepo,
}
