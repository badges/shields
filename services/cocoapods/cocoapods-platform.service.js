'use strict'

const BaseCocoaPodsService = require('./cocoapods-base')

module.exports = class CocoapodsPlatform extends BaseCocoaPodsService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'cocoapods/p',
      pattern: ':spec',
    }
  }

  static get examples() {
    return [
      {
        title: 'Cocoapods platforms',
        namedParams: { spec: 'AFNetworking' },
        staticPreview: this.render({ platforms: 'ios | osx | watchos | tvos' }),
      },
    ]
  }

  static render({ platforms }) {
    return {
      message: platforms,
      // https://github.com/badges/shields/pull/184
      color: '#989898',
    }
  }

  async handle({ spec }) {
    const data = await this.fetch({ spec })
    const platforms = Object.keys(data.platforms).join(' | ')
    return this.constructor.render({ platforms })
  }

  static get defaultBadgeData() {
    return { label: 'platform' }
  }
}
