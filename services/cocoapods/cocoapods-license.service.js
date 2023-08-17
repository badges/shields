import { pathParams } from '../index.js'
import BaseCocoaPodsService from './cocoapods-base.js'

export default class CocoapodsLicense extends BaseCocoaPodsService {
  static category = 'license'
  static route = { base: 'cocoapods/l', pattern: ':spec' }

  static openApi = {
    '/cocoapods/l/{spec}': {
      get: {
        summary: 'Cocoapods License',
        parameters: pathParams({
          name: 'spec',
          example: 'AFNetworking',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

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
