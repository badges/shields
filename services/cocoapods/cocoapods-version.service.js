import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import BaseCocoaPodsService from './cocoapods-base.js'

export default class CocoapodsVersion extends BaseCocoaPodsService {
  static category = 'version'
  static route = { base: 'cocoapods/v', pattern: ':spec' }

  static openApi = {
    '/cocoapods/v/{spec}': {
      get: {
        summary: 'Cocoapods Version',
        parameters: pathParams({
          name: 'spec',
          example: 'AFNetworking',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'pod' }

  async handle({ spec }) {
    const { version } = await this.fetch({ spec })
    return renderVersionBadge({ version })
  }
}
