import { pathParams } from '../index.js'
import { NotFound } from '../../core/base-service/errors.js'
import { renderVersionBadge } from '../version.js'
import { BasePolymartService, description } from './polymart-base.js'

export default class PolymartLatestVersion extends BasePolymartService {
  static category = 'version'

  static route = {
    base: 'polymart/version',
    pattern: ':resourceId',
  }

  static openApi = {
    '/polymart/version/{resourceId}': {
      get: {
        summary: 'Polymart Version',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '323',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'polymart',
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return renderVersionBadge({
      version: response.resource.updates.latest.version,
    })
  }
}
