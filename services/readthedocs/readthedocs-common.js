import Joi from 'joi'
import { NotFound } from '../index.js'

const schema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        state: Joi.object({
          code: Joi.string().required(),
        }).required(),
        success: Joi.boolean().required(),
      }),
    )
    .required(),
}).required()

const buildsQuery = {
  fields: 'state,success',
  limit: 10,
  running: false,
}

const hosts = {
  org: 'https://app.readthedocs.org',
  com: 'https://app.readthedocs.com',
}

function apiOrigin(domain) {
  return hosts[domain]
}

async function fetchBuildStatus(
  serviceInstance,
  { domain, project, version = 'latest' },
) {
  return serviceInstance._requestJson(
    serviceInstance.authHelper.withBearerAuthHeader(
      {
        schema,
        url: `${apiOrigin(domain)}/api/v3/projects/${encodeURIComponent(project)}/versions/${encodeURIComponent(version)}/builds/`,
        options: { searchParams: buildsQuery },
        httpErrors: {
          401: 'invalid token',
          403: 'project not authorized',
          404: 'project or version not found',
        },
      },
      'Token',
    ),
  )
}

function statusFromResults(results) {
  const build = results.find(({ state }) => state.code === 'finished')
  if (!build) {
    throw new NotFound({
      prettyMessage: 'no finished builds',
    })
  }
  return build.success ? 'passing' : 'failing'
}

export { apiOrigin, buildsQuery, fetchBuildStatus, statusFromResults }
