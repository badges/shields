import { NotFound } from '../../core/base-service/errors.js'
import { renderVersionBadge } from '../version.js'
import { BasePolymartService, documentation } from './polymart-base.js'
export default class PolymartLatestVersion extends BasePolymartService {
  static category = 'version'

  static route = {
    base: 'polymart/version',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Polymart Version',
      namedParams: {
        resourceId: '323',
      },
      staticPreview: renderVersionBadge({
        version: 'v1.2.9',
      }),
      documentation,
    },
  ]

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
