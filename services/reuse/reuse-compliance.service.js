'use strict'
const Joi = require('joi')
const { BaseJsonService } = require('..')
const { renderReuseBadge } = require('./reuse-compliance-helper')

const responseSchema = Joi.object({
  badge: Joi.string(),
  hash: Joi.string(),
  last_access: Joi.date(),
  lint_code: Joi.number(),
  lint_output: Joi.string(),
  status: Joi.string().required(),
  url: Joi.string().required(),
}).required()

module.exports = class Reuse extends BaseJsonService {
  static category = 'license'

  static route = {
    base: 'reuse/compliance',
    pattern: ':gitserver/:user/:repository',
  }

  static examples = [
    {
      title: 'REUSE Compliance',
      namedParams: {
        gitserver: 'github',
        user: 'fsfe',
        repository: 'reuse-tool',
      },
      staticPreview: this.render({ status: 'compliant' }),
      keywords: ['license'],
    },
  ]

  static defaultBadgeData = {
    label: 'REUSE',
  }

  static render({ status }) {
    return renderReuseBadge({ status })
  }

  async fetch({ gitserver, user, repository }) {
    return await this._requestJson({
      schema: responseSchema,
      url: `https://api.reuse.software/status/${gitserver}.com/${user}/${repository}`,
      errorMessages: {
        400: 'Not a Git repository',
      },
    })
  }

  async handle({ gitserver, user, repository }) {
    const { status } = await this.fetch({ gitserver, user, repository })
    return this.constructor.render({ status })
  }
}
