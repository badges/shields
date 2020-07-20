'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  currentReleaseVersion: Joi.string().required(),
}).required()

module.exports = class Flathub extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'flathub/v',
      pattern: ':package',
    }
  }

  static get examples() {
    return [
      {
        title: 'Flathub',
        namedParams: {
          package: 'org.mozilla.firefox',
        },
        staticPreview: renderVersionBadge({ version: '78.0.2' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'flathub' }
  }

  async handle({ package }) {
    const data = await this._requestJson({
      schema,
      url: `https://flathub.org/api/v1/apps/${encodeURIComponent(
        package
      )}`,
    })
    return renderVersionBadge({ version: data.currentReleaseVersion })
  }
}
