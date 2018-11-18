'use strict'

const BaseService = require('../base')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { InvalidResponse } = require('../errors')

module.exports = class FDroid extends BaseService {
  async fetch({ appId }) {
    // currently, we only use the txt format. There are few apps using the yml format.
    const url = `https://gitlab.com/fdroid/fdroiddata/raw/master/metadata/${appId}.txt`
    const { buffer } = await this._request({
      url,
      options: {},
      errorMessages: {
        404: 'app not found',
      },
    })
    const metadata = buffer.toString()
    // we assume the layout as provided here:
    // https://gitlab.com/fdroid/fdroiddata/raw/master/metadata/axp.tool.apkextractor.txt
    const positionOfCurrentVersionAtEndOfTheFile = metadata.lastIndexOf(
      'Current Version:'
    ) // credits: https://stackoverflow.com/a/11134049
    const lastVersion = metadata.substring(
      positionOfCurrentVersionAtEndOfTheFile
    )
    const match = lastVersion.match(/^Current Version:\s*(.*?)\s*$/m)
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

  async handle({ appId }) {
    const result = await this.fetch({ appId })
    return this.constructor.render(result)
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
    }
  }

  static get examples() {
    return [
      {
        title: 'F-Droid',
        exampleUrl: 'org.thosp.yourlocalweather',
        pattern: ':appId',
        staticExample: this.render({ version: '1.0' }),
        keywords: ['fdroid', 'android', 'app'],
      },
    ]
  }
}
