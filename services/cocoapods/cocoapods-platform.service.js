import { pathParams } from '../index.js'
import BaseCocoaPodsService from './cocoapods-base.js'

export default class CocoapodsPlatform extends BaseCocoaPodsService {
  static category = 'platform-support'
  static route = { base: 'cocoapods/p', pattern: ':spec' }

  static openApi = {
    '/cocoapods/p/{spec}': {
      get: {
        summary: 'Cocoapods platforms',
        parameters: pathParams({
          name: 'spec',
          example: 'AFNetworking',
        }),
      },
    },
  }

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
