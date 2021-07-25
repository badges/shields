import BaseCocoaPodsService from './cocoapods-base.js'

export default class CocoapodsPlatform extends BaseCocoaPodsService {
  static category = 'platform-support'
  static route = { base: 'cocoapods/p', pattern: ':spec' }

  static examples = [
    {
      title: 'Cocoapods platforms',
      namedParams: { spec: 'AFNetworking' },
      staticPreview: this.render({
        platforms: ['ios', 'osx', 'watchos', 'tvos'],
      }),
    },
  ]

  static defaultBadgeData = { label: 'platform' }

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
