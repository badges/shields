import { renderVersionBadge } from '../version.js'
import OpenVSXBase from './open-vsx-base.js'

export default class OpenVSXVersion extends OpenVSXBase {
  static category = 'version'

  static route = {
    base: 'open-vsx',
    pattern: 'v/:namespace/:extension',
  }

  static examples = [
    {
      title: 'Open VSX Version',
      namedParams: { namespace: 'redhat', extension: 'java' },
      staticPreview: this.render({ version: '0.69.0' }),
      keywords: this.keywords,
    },
  ]

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ namespace, extension }) {
    const { version } = await this.fetch({ namespace, extension })
    return this.constructor.render({ version })
  }
}
