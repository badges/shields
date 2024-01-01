import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { optionalUrl } from '../validators.js'
import { BaseJsonService, queryParam, pathParam } from '../index.js'

const schema = Joi.object({
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('none'), Joi.equal('killed'))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class DroneBuild extends BaseJsonService {
  static category = 'build'
  static route = {
    base: 'drone/build',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static auth = { passKey: 'drone_token', serviceKey: 'drone' }

  static openApi = {
    '/drone/build/{user}/{repo}': {
      get: {
        summary: 'Drone',
        parameters: [
          pathParam({
            name: 'user',
            example: 'drone',
          }),
          pathParam({
            name: 'repo',
            example: 'autoscaler',
          }),
          queryParam({
            name: 'server',
            example: 'https://drone.shields.io',
          }),
        ],
      },
    },
    '/drone/build/{user}/{repo}/{branch}': {
      get: {
        summary: 'Drone (branch)',
        parameters: [
          pathParam({
            name: 'user',
            example: 'drone',
          }),
          pathParam({
            name: 'repo',
            example: 'autoscaler',
          }),
          pathParam({
            name: 'branch',
            example: 'master',
          }),
          queryParam({
            name: 'server',
            example: 'https://drone.shields.io',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  async handle({ user, repo, branch }, { server = 'https://cloud.drone.io' }) {
    const json = await this._requestJson(
      this.authHelper.withBearerAuthHeader({
        schema,
        url: `${server}/api/repos/${user}/${repo}/builds/latest`,
        options: {
          searchParams: { ref: branch ? `refs/heads/${branch}` : undefined },
        },
        httpErrors: {
          401: 'repo not found or not authorized',
        },
      }),
    )
    return renderBuildStatusBadge({ status: json.status })
  }
}
