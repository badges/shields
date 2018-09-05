'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')

const hockeyappSchema = Joi.object({
  app_versions: Joi.array().items(
    Joi.object({
      version: Joi.string().required(),
      shortversion: Joi.string().required(),
    })
  ),
}).required()

module.exports = class Hockeyapp extends BaseJsonService {
  async fetch({ apptoken, appid }) {
    const url = `https://rink.hockeyapp.net/api/2/apps/${appid}/app_versions`
    const options = { headers: { 'X-HockeyAppToken': apptoken } }
    return this._requestJson({
      url,
      schema: hockeyappSchema,
      options: options,
    })
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ apptoken, appid }) {
    const json = await this.fetch({ apptoken, appid })

    if (json.app_versions === undefined || json.app_versions.length === 0) {
      throw new NotFound()
    }

    const latestVersionObject = json.app_versions[0]

    let version

    // need this check because hockeyapp handles build numbers differntly for iOS and Android
    if (
      !latestVersionObject.version.includes(latestVersionObject.shortversion)
    ) {
      version = `${latestVersionObject.shortversion}.${
        latestVersionObject.version
      }`
    } else {
      version = latestVersionObject.version
    }

    return this.constructor.render({ version: version })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'hockeyapp' }
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'hockeyapp/v',
      format: '(.+)/(.+)',
      capture: ['apptoken', 'appid'],
    }
  }

  static get examples() {
    return [
      {
        exampleUrl: 'hockeyapp/simple',
        urlPattern: ':apptoken/:appid',
        staticExample: this.render({ version: '1.0' }),
      },
    ]
  }
}
