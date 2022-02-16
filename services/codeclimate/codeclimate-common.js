import Joi from 'joi'
import { NotFound } from '../index.js'

const keywords = ['codeclimate']

const isLetterGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F').required()

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
    options: { searchParams: { github_slug: `${user}/${repo}` } },
  })
  if (repoInfo === undefined) {
    throw new NotFound({ prettyMessage: 'repo not found' })
  }
  return repoInfo
}

export { keywords, isLetterGrade, fetchRepo }
