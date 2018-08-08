'use strict'

const { licenseToColor } = require('../../lib/licenses')
const { toArray } = require('../../lib/badge-data')
const NpmBase = require('./npm-base')

module.exports = class NpmLicense extends NpmBase {
  static get category() {
    return 'license'
  }

  static get defaultBadgeData() {
    return { label: 'license' }
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
    if (licenses.length === 0) {
      return { message: 'missing', color: 'red' }
    }

    return {
      message: licenses.join(', '),
      // TODO This does not provide a color when more than one license is
      // present. Probably that should be fixed.
      color: licenseToColor(licenses),
    }
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
