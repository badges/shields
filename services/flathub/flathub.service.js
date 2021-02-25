'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  currentReleaseVersion: Joi.string().required(),
}).required()

module.exports = class Flathub extends BaseJsonService {
  static category = 'version'
  static route = { base: 'flathub/v', pattern: ':packageName' }
  static examples = [
    {
      title: 'Flathub',
      namedParams: {
        packageName: 'org.mozilla.firefox',
      },
      staticPreview: renderVersionBadge({ version: '78.0.2' }),
    },
  ]

  static defaultBadgeData = { label: 'flathub' }

  async handle({ packageName }) {
    const data = await this._requestJson({
      schema,
      url: `https://flathub.org/api/v1/apps/${encodeURIComponent(packageName)}`,
    })
    return renderVersionBadge({ version: data.currentReleaseVersion })
  }
}
