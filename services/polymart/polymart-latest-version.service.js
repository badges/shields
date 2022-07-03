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
        resourceId: '1620',
      },
      staticPreview: this.render({ version: 1.2 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'version',
    color: 'blue',
  }

  static render({ version }) {
    return {
      message: `${version}`,
    }
  }

  async handle({ resourceId }) {
    const { response } = await this.fetch({ resourceId })
    return this.constructor.render({
      version: response.resource.updates.latest.version,
    })
  }
}
