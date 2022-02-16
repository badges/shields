import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { optionalUrl } from '../validators.js'
import { BaseJsonService } from '../index.js'

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
  static examples = [
    {
      title: 'Drone (cloud)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'harness',
        repo: 'drone',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
    {
      title: 'Drone (cloud) with branch',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'harness',
        repo: 'drone',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
    {
      title: 'Drone (self-hosted)',
      pattern: ':user/:repo',
      queryParams: { server: 'https://drone.shields.io' },
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
    {
      title: 'Drone (self-hosted) with branch',
      pattern: ':user/:repo/:branch',
      queryParams: { server: 'https://drone.shields.io' },
      namedParams: {
        user: 'badges',
        repo: 'shields',
        branch: 'feat/awesome-thing',
      },
      staticPreview: renderBuildStatusBadge({ status: 'success' }),
    },
  ]

  static defaultBadgeData = { label: 'build' }

  async handle({ user, repo, branch }, { server = 'https://cloud.drone.io' }) {
    const json = await this._requestJson(
      this.authHelper.withBearerAuthHeader({
        schema,
        url: `${server}/api/repos/${user}/${repo}/builds/latest`,
        options: {
          searchParams: { ref: branch ? `refs/heads/${branch}` : undefined },
        },
        errorMessages: {
          401: 'repo not found or not authorized',
        },
      })
    )
    return renderBuildStatusBadge({ status: json.status })
  }
}
