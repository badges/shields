'use strict'

const Joi = require('joi')
const BaseService = require('../base')
const validate = require('../../lib/validate')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { InvalidResponse, InvalidParameter } = require('../errors')

module.exports = class FDroid extends BaseService {
  async fetch({ appId, format }) {
    // currently, we only use the txt format. There are few apps using the yml format.
    const url = `https://gitlab.com/fdroid/fdroiddata/raw/master/metadata/${appId}`
    const reqOptions = {
      url: `${url}.${format || 'txt'}`,
      options: {},
      errorMessages: {
        404: 'app not found',
      },
    }
    let buffer
    try {
      ;({ buffer } = await this._request(reqOptions))
    } catch (error) {
      if (format) {
        throw error
      }
      ;({ buffer } = await this._request({ ...reqOptions, url: `${url}.yml` }))
    }
    const metadata = buffer.toString()
    // we assume the layout as provided here:
    // https://gitlab.com/fdroid/fdroiddata/raw/master/metadata/axp.tool.apkextractor.txt
    const value = (metadata.match(/CurrentVersion:|Current Version:/) || [
      'Current Version:',
    ])[0]
    const positionOfCurrentVersionAtEndOfTheFile = metadata.lastIndexOf(value) // credits: https://stackoverflow.com/a/11134049
    const lastVersion = metadata.substring(
      positionOfCurrentVersionAtEndOfTheFile
    )
    const match = lastVersion.match(new RegExp(`^${value}\\s*(.*?)\\s*$`, 'm'))
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'invalid response',
        underlyingError: new Error('could not find version on website'),
      })
    }
    return { version: match[1] }
  }

  static render({ version }) {
    return {
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ appId }, queryParams) {
    const constructor = this.constructor
    const { metadata_format: format } = constructor.validateParams(queryParams)
    const result = await this.fetch({ appId, format })

    return constructor.render(result)
  }

  static validateParams(queryParams) {
    const queryParamsSchema = Joi.object({
      metadata_format: Joi.string().valid(['yml', 'txt']),
    }).required()

    return validate(
      {
        ErrorClass: InvalidParameter,
        prettyErrorMessage:
          'invalid parameter, valid metadata_format=yml or txt',
        traceErrorMessage: 'Query params did not match schema',
        traceSuccessMessage: 'Query params after validation',
      },
      queryParams,
      queryParamsSchema
    )
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'f-droid' }
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'f-droid/v',
      format: '(.+)',
      capture: ['appId'],
      queryParams: ['metadata_format'],
    }
  }

  static get examples() {
    return [
      {
        title: 'F-Droid',
        exampleUrl: 'org.thosp.yourlocalweather?metadata_format=yml',
        pattern: ':appId',
        staticExample: this.render({ version: '1.0' }),
        keywords: ['fdroid', 'android', 'app'],
      },
    ]
  }
}
