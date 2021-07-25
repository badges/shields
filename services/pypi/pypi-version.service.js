import { renderVersionBadge } from '../version.js'
import PypiBase from './pypi-base.js'

export default class PypiVersion extends PypiBase {
  static category = 'version'

  static route = this.buildRoute('pypi/v')

  static examples = [
    {
      title: 'PyPI',
      pattern: ':packageName',
      namedParams: { packageName: 'nine' },
      staticPreview: this.render({ version: '1.0.0' }),
      keywords: ['python'],
    },
  ]

  static defaultBadgeData = { label: 'pypi' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ egg }) {
    const {
      info: { version },
    } = await this.fetch({ egg })
    return this.constructor.render({ version })
  }
}
