'use strict'

const { renderLicenseBadge } = require('../../lib/licenses')
const { toArray } = require('../../lib/badge-data')
const NpmBase = require('./npm-base')

module.exports = class NpmLicense extends NpmBase {
  static get category() {
    return 'license'
  }

  static get url() {
    return this.buildUrl('npm/l', { withTag: false })
  }

  static get examples() {
    return [
      {
        previewUrl: 'express',
        keywords: ['node'],
      },
      {
        previewUrl: 'express',
        query: { registry_uri: 'https://registry.npmjs.com' },
        keywords: ['node'],
      },
    ]
  }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
    )
    const { license } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const licenses = toArray(license).map(
      license => (typeof license === 'string' ? license : license.type)
    )
    return this.constructor.render({ licenses })
  }
}
