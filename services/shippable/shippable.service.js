import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, redirector } from '../index.js'

// source: https://github.com/badges/shields/pull/1362#discussion_r161693830
const statusCodes = {
  0: 'waiting',
  10: 'queued',
  20: 'processing',
  30: 'success',
  40: 'skipped',
  50: 'unstable',
  60: 'timeout',
  70: 'cancelled',
  80: 'failed',
  90: 'stopped',
}

const schema = Joi.array()
  .items(
    Joi.object({
      branchName: Joi.string().required(),
      statusCode: Joi.number()
        .valid(...Object.keys(statusCodes).map(key => parseInt(key)))
        .required(),
    }).required()
  )
  .required()

class Shippable extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'shippable',
    pattern: ':projectId/:branch+',
  }

  static examples = [
    {
      title: 'Shippable',
      namedParams: {
        projectId: '5444c5ecb904a4b21567b0ff',
        branch: 'master',
      },
      staticPreview: this.render({ code: 30 }),
    },
  ]

  static defaultBadgeData = { label: 'shippable' }

  static render({ code }) {
    return renderBuildStatusBadge({ label: 'build', status: statusCodes[code] })
  }

  async fetch({ projectId }) {
    const url = `https://api.shippable.com/projects/${projectId}/branchRunStatus`
    return this._requestJson({ schema, url })
  }

  async handle({ projectId, branch }) {
    const data = await this.fetch({ projectId })
    const builds = data.filter(result => result.branchName === branch)
    if (builds.length === 0) {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return this.constructor.render({ code: builds[0].statusCode })
  }
}

const ShippableRedirect = redirector({
  category: 'build',
  route: {
    base: 'shippable',
    pattern: ':projectId',
  },
  transformPath: ({ projectId }) => `/shippable/${projectId}/master`,
  dateAdded: new Date('2020-07-18'),
})

export { Shippable, ShippableRedirect }
