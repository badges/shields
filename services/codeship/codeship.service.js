import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(
      isBuildStatus,
      Joi.equal('project not found', 'branch not found', 'ignored', 'blocked')
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

  static examples = [
    {
      title: 'Codeship',
      pattern: ':projectId',
      namedParams: {
        projectId: 'd6c1ddd0-16a3-0132-5f85-2e35c05e22b1',
      },
      staticPreview: renderBuildStatusBadge({ status: 'passing' }),
    },
    {
      title: 'Codeship (branch)',
      pattern: ':projectId/:branch',
      namedParams: {
        projectId: '0bdb0440-3af5-0133-00ea-0ebda3a33bf6',
        branch: 'master',
      },
      staticPreview: renderBuildStatusBadge({ status: 'passing' }),
    },
  ]

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
