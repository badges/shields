import Joi from 'joi'
import { NotFound } from '../index.js'

const isLetterGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F').required()

const repoSchema = Joi.object({
  data: Joi.array()
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
      }),
    )
    .required(),
}).required()

async function fetchRepo(serviceInstance, { user, repo }) {
  const { data: repoInfos } = await serviceInstance._requestJson({
    schema: repoSchema,
    url: 'https://api.codeclimate.com/v1/repos',
    options: { searchParams: { github_slug: `${user}/${repo}` } },
  })
  if (repoInfos.length === 0) {
    throw new NotFound({ prettyMessage: 'repo not found' })
  }
  return repoInfos
}

export { isLetterGrade, fetchRepo }
