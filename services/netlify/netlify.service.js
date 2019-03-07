'use strict'

const Joi = require('joi')
const { BaseSvgScrapingService } = require('..')
const { renderColorStatusBadge } = require('../color-matcher')

const schema = Joi.object().required()

module.exports = class Netlify extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return { label: 'netlify' }
  }

  static render({ label, status }) {
    return renderColorStatusBadge({ label, status })
  }

  static get route() {
    return {
      base: 'netlify',
      pattern: ':appId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Netlify',
        namedParams: {
          appId: '0028c6a7-b7ae-49f6-b847-917b40b5b13f',
        },
        staticPreview: renderColorStatusBadge({ status: '#0f0' }),
      },
    ]
  }

  async fetch({ appId }) {
    const url = `https://api.netlify.com/api/v1/badges/${appId}/deploy-status`
    return this._requestSvg({
      schema,
      url,
      valueMatcher: /(?<=fill-rule="nonzero" stroke=").([^"]+)/,
    })
  }

  async handle({ appId }) {
    const { message: status } = await this.fetch({ appId })
    return this.constructor.render({ label: 'netlify', status })
  }
}
