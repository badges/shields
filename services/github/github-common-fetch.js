import Joi from 'joi'
import { InvalidResponse } from '../index.js'
import { errorMessagesFor } from './github-helpers.js'

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

const workflowRunSchema = Joi.object({
  name: Joi.string().allow(null),
  event: Joi.string().required(),
  status: Joi.string().allow(null),
  conclusion: Joi.string().allow(null),
})

const workflowSchema = Joi.object({
  total_count: Joi.number().min(1).required(),
  workflow_runs: Joi.array().min(1).items(workflowRunSchema).required(),
}).required()

async function fetchWorkflowRuns(
  serviceInstance,
  { user, repo, workflow, branch, event }
) {
  let url
  let errorMsg
  if (workflow) {
    url = `/repos/${user}/${repo}/actions/workflows/${workflow}/runs`
    errorMsg = 'repo or workflow not found'
  } else {
    url = `/repos/${user}/${repo}/actions/runs`
    errorMsg = 'repo not found'
  }

  const { workflow_runs } = await serviceInstance._requestJson({
    schema: workflowSchema,
    url,
    options: {
      searchParams: { branch, event },
    },
    validateArgs: {
      prettyErrorMessage: 'no status',
    },
    errorMessages: errorMessagesFor(errorMsg),
  })
  return workflow_runs[0]
}

const contentSchema = Joi.object({
  // https://github.com/hapijs/joi/issues/1430
  content: Joi.string().required(),
  encoding: Joi.equal('base64').required(),
}).required()

async function fetchRepoContent(
  serviceInstance,
  { user, repo, branch = 'HEAD', filename }
) {
  const errorMessages = errorMessagesFor(
    `repo not found, branch not found, or ${filename} missing`
  )
  if (serviceInstance.staticAuthConfigured) {
    const { content } = await serviceInstance._requestJson({
      schema: contentSchema,
      url: `/repos/${user}/${repo}/contents/${filename}`,
      options: { searchParams: { ref: branch } },
      errorMessages,
    })

    try {
      return Buffer.from(content, 'base64').toString('utf-8')
    } catch (e) {
      throw new InvalidResponse({ prettyMessage: 'undecodable content' })
    }
  } else {
    const { buffer } = await serviceInstance._request({
      url: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filename}`,
      errorMessages,
    })
    return buffer
  }
}

async function fetchJsonFromRepo(
  serviceInstance,
  { schema, user, repo, branch = 'HEAD', filename }
) {
  if (serviceInstance.staticAuthConfigured) {
    const buffer = await fetchRepoContent(serviceInstance, {
      user,
      repo,
      branch,
      filename,
    })
    const json = serviceInstance._parseJson(buffer)
    return serviceInstance.constructor._validate(json, schema)
  } else {
    return serviceInstance._requestJson({
      schema,
      url: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filename}`,
      errorMessages: errorMessagesFor(
        `repo not found, branch not found, or ${filename} missing`
      ),
    })
  }
}

export { fetchIssue, fetchWorkflowRuns, fetchRepoContent, fetchJsonFromRepo }
