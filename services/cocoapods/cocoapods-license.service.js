'use strict'

const BaseCocoaPodsService = require('./cocoapods-base')

module.exports = class CocoapodsLicense extends BaseCocoaPodsService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cocoapods/l',
      pattern: ':spec',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods',
        namedParams: { spec: 'AFNetworking' },
        staticPreview: this.render({ license: 'MIT' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static render({ license }) {
    if (license) {
      return {
        message: license,
        // https://github.com/badges/shields/pull/184
        color: '#373737',
      }
    } else {
      return {
        message: 'not specified',
        color: 'lightgray',
      }
    }
  }

  async handle({ spec }) {
    const data = await this.fetch({ spec })
    const license =
      typeof data.license === 'object' ? data.license.type : data.license
    return this.constructor.render({ license })
  }
}
