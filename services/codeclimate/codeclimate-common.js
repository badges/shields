'use strict'

const Joi = require('joi')
const { NotFound } = require('..')

const keywords = ['codeclimate']

const repoSchema = Joi.object({
  data: Joi.array()
    .max(1)
    .items(
      Joi.object({
        id: Joi.string().required(),
        relationships: Joi.object({
          latest_default_branch_snapshot: Joi.object({
            data: Joi.object({
              id: Joi.string().required(),
            }).allow(null),
          }).required(),
          latest_default_branch_test_report: Joi.object({
            data: Joi.object({
              id: Joi.string().required(),
            }).allow(null),
          }).required(),
        }).required(),
      })
    )
    .required(),
}).required()

async function fetchRepo(serviceInstance, { user, repo }) {
  const {
    data: [repoInfo],
  } = await serviceInstance._requestJson({
    schema: repoSchema,
    url: 'https://api.codeclimate.com/v1/repos',
    options: { qs: { github_slug: `${user}/${repo}` } },
  })
  if (repoInfo === undefined) {
    throw new NotFound({ prettyMessage: 'repo not found' })
  }
  return repoInfo
}

module.exports = {
  keywords,
  fetchRepo,
}
