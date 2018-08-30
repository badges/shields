'use strict'

const BaseHTTPService = require('../base-http')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { InvalidResponse } = require('../errors')

module.exports = class FDroid extends BaseHTTPService {
  async fetch({ appId }) {
    const url = `https://f-droid.org/en/packages/${appId}/`
    return this._requestHTTP({
      url,
      options: {},
      errorMessages: {
        404: 'app not found',
      },
    }).then(({ res, buffer }) => {
      const website = buffer.toString()
      // we assume the layout as provided here:
      // https://gitlab.com/fdroid/fdroid-website/blob/9ae61894a18889ed749d36d5afbd0db3d0b0cfdd/_layouts/package.html#L147
      const match = website.match(
        /<div\s[^>]*class="package-version-header"(?:\s[^>]*)?>[^<]*<a\s+name="([^:>]*)"(?:\s[^>]*)?>/
      )
      if (!match) {
        throw new InvalidResponse({
          prettyMessage: 'fix this badge',
          underlyingError: new Error('could not find version on website'),
        })
      }
      return { version: match[1] }
    })
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
    return { label: 'F-Droid' }
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'f-droid/v',
      format: '(.+)',
      capture: ['appId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'f-droid',
        exampleUrl: 'org.thosp.yourlocalweather',
        urlPattern: ':appId',
        staticExample: this.render({ version: '1.0' }),
        keywords: ['fdroid', 'android', 'app'],
      },
    ]
  }
}
