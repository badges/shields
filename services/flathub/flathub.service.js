'use strict'

const Joi = require('@hapi/joi')
const { InvalidResponse, NotFound } = require('..')
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
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Flathub',
        namedParams: {
          packageName: 'org.mozilla.firefox',
        },
        staticPreview: renderVersionBadge({ version: '78.0.2' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'flathub' }
  }

  async handle({ packageName }) {
    try {
      const data = await this._requestJson({
        schema,
        url: `https://flathub.org/api/v1/apps/${encodeURIComponent(
          packageName
        )}`,
      })
      return renderVersionBadge({ version: data.currentReleaseVersion })
    } catch (error) {
      if (error instanceof InvalidResponse) {
        throw new NotFound({
          prettyMessage: `${packageName} not found`,
        })
      }
      throw error
    }
  }
}
