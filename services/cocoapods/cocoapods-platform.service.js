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
        staticPreview: this.render({
          platforms: ['ios', 'osx', 'watchos', 'tvos'],
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'platform' }
  }

  static render({ platforms }) {
    return {
      message: platforms.join(' | '),
      // https://github.com/badges/shields/pull/184
      color: '#989898',
    }
  }

  async handle({ spec }) {
    const { platforms } = await this.fetch({ spec })
    return this.constructor.render({ platforms: Object.keys(platforms) })
  }
}
