'use strict'

const Joi = require('joi')
const { BaseSvgScrapingService } = require('..')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('app not found'))
    .required(),
}).required()

module.exports = class Netlify extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static mapBuildStatusToColor(color) {
    if (color === '#007A70') return 'passing'
    if (color === '#A88100') return 'netlify-building'
    if (color === '#AD2831') return 'failing'
  }

  static get defaultBadgeData() {
    return { label: 'netlify' }
  }

  static render({ label, status }) {
    return renderBuildStatusBadge({ label, status })
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
        staticPreview: renderBuildStatusBadge({
          label: 'netlify',
          status: 'passing',
        }),
      },
    ]
  }

  async fetch({ appId }) {
    const url = `https://api.netlify.com/api/v1/badges/${appId}/deploy-status`
    return this._requestaSvg({
      schema,
      errorMessages: {
        404: 'app not found',
      },
      url,
      valueMatcher: /(?<=fill-rule="nonzero" stroke=").([^"]+)/,
    })
  }

  async handle({ appId }) {
    const { message: color } = await this.fetch({ appId })
    return this.constructor.render({
      status: this.constructor.mapBuildStatusToColor(color),
    })
  }
}
