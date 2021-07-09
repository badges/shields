import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import BaseCondaService from './conda-base.js'

export default class CondaVersion extends BaseCondaService {
  static category = 'version'
  static route = { base: 'conda', pattern: ':variant(v|vn)/:channel/:pkg' }

  static examples = [
    {
      title: 'Conda',
      namedParams: { channel: 'conda-forge', package: 'python' },
      pattern: 'v/:channel/:package',
      staticPreview: this.render({
        variant: 'v',
        channel: 'conda-forge',
        version: '3.7.1',
      }),
    },
    {
      title: 'Conda (channel only)',
      namedParams: { channel: 'conda-forge', package: 'python' },
      pattern: 'vn/:channel/:package',
      staticPreview: this.render({
        variant: 'vn',
        channel: 'conda-forge',
        version: '3.7.1',
      }),
    },
  ]

  static render({ variant, channel, version }) {
    return {
      label: variant === 'vn' ? channel : `conda|${channel}`,
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({
      variant,
      channel,
      version: json.latest_version,
    })
  }
}
