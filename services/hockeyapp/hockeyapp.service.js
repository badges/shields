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
  async fetch({ apitoken, appid }) {
    const url = `https://rink.hockeyapp.net/api/2/apps/${appid}/app_versions`
    const options = { headers: { 'X-HockeyAppToken': apitoken } }
    return this._requestJson({
      url,
      schema: hockeyappSchema,
      options: options,
    })
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ apitoken, appid }) {
    const json = await this.fetch({ apitoken, appid })

    if (json.app_versions.length === 0) {
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

    return this.constructor.render({ version })
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
      capture: ['apitoken', 'appid'],
    }
  }

  static get examples() {
    return [
      {
        exampleUrl:
          '78e9ae0287ca4a07b2cbbb1338e1c71b/7e53b1f0ebe171be1b9004ff04a2f663',
        urlPattern: ':read-only-api-token/:appid',
        staticExample: this.render({ version: '1.0.0' }),
        documentation: `Log in to HockeyApp and follow the link https://rink.hockeyapp.net/manage/auth_tokens 
          to generate a read-only API Token to avoid that others can e.g. manipulat your build uploads. 
          Optionally you can also set the scope of the token just to the app that is used by your badge. 
          More information about the HockeyApp API can be found here https://support.hockeyapp.net/kb/api/api-basics-and-authentication.`,
      },
    ]
  }
}
