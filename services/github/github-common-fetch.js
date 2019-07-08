'use strict'

const Joi = require('@hapi/joi')
const { errorMessagesFor } = require('./github-helpers')
const { InvalidResponse } = require('..')

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
  const errorMessages = errorMessagesFor(
    `repo not found, branch not found, or ${filename} missing`
  )
  if (serviceInstance.staticAuthConfigured) {
    const url = `/repos/${user}/${repo}/contents/${filename}`
    const options = { qs: { ref: branch } }
    const { content } = await serviceInstance._requestJson({
      schema: contentSchema,
      url,
      options,
      errorMessages,
    })

    let decoded
    try {
      decoded = Buffer.from(content, 'base64').toString('utf-8')
    } catch (e) {
      throw new InvalidResponse({ prettyMessage: 'undecodable content' })
    }
    const json = serviceInstance._parseJson(decoded)
    return serviceInstance.constructor._validate(json, schema)
  } else {
    const url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filename}`
    return serviceInstance._requestJson({
      schema,
      url,
      errorMessages,
    })
  }
}

const releaseInfoSchema = Joi.object({
  tag_name: Joi.string().required(),
  prerelease: Joi.boolean().required(),
}).required()
const releaseInfoArraySchema = Joi.array()
  .items(releaseInfoSchema)
  .required()

async function fetchLatestRelease(
  serviceInstance,
  { user, repo, includePre = false }
) {
  const commonAttrs = {
    errorMessages: errorMessagesFor('no releases or repo not found'),
  }
  if (includePre) {
    const [releaseInfo] = await serviceInstance._requestJson({
      schema: releaseInfoArraySchema,
      url: `/repos/${user}/${repo}/releases`,
      ...commonAttrs,
    })
    return releaseInfo
  } else {
    const releaseInfo = await serviceInstance._requestJson({
      schema: releaseInfoSchema,
      url: `/repos/${user}/${repo}/releases/latest`,
      ...commonAttrs,
    })
    return releaseInfo
  }
}

module.exports = {
  fetchIssue,
  fetchJsonFromRepo,
  fetchLatestRelease,
}
