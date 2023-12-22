import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(
      isBuildStatus,
      Joi.equal('project not found', 'branch not found', 'ignored', 'blocked'),
    )
    .required(),
}).required()

const pendingStatus = 'pending'
const notBuiltStatus = 'not built'

const statusMap = {
  testing: pendingStatus,
  waiting: pendingStatus,
  initiated: pendingStatus,
  stopped: notBuiltStatus,
  ignored: notBuiltStatus,
  blocked: notBuiltStatus,
  infrastructure_failure: 'failed',
}

export default class Codeship extends BaseSvgScrapingService {
  static category = 'build'
  static route = { base: 'codeship', pattern: ':projectId/:branch*' }

  static openApi = {
    '/codeship/{projectId}': {
      get: {
        summary: 'Codeship',
        parameters: pathParams({
          name: 'projectId',
          example: 'd6c1ddd0-16a3-0132-5f85-2e35c05e22b1',
        }),
      },
    },
    '/codeship/{projectId}/{branch}': {
      get: {
        summary: 'Codeship (branch)',
        parameters: pathParams(
          {
            name: 'projectId',
            example: '0bdb0440-3af5-0133-00ea-0ebda3a33bf6',
          },
          {
            name: 'branch',
            example: 'master',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    status = statusMap[status] || status
    return renderBuildStatusBadge({ status })
  }

  async fetch({ projectId, branch }) {
    const url = `https://app.codeship.com/projects/${projectId}/status`
    return this._requestSvg({
      schema,
      url,
      options: { searchParams: { branch } },
      valueMatcher: /<g id="status_2">(?:[.\s\S]*)\/><\/g><g id="([\w\s]*)"/,
    })
  }

  async handle({ projectId, branch }) {
    const { message: status } = await this.fetch({ projectId, branch })
    return this.constructor.render({ status })
  }
}
