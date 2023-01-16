import { NotFound } from '../../core/base-service/errors.js'
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
      staticPreview: this.render({
        version: '1.2.9',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
  }

  static render({ version }) {
    return {
      message: `${version}`,
    }
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    if (!response.resource) {
      throw new NotFound()
    }
    return this.constructor.render({
      version: response.resource.updates.latest.version,
    })
  }
}
