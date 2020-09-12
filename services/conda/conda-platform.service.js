'use strict'

const BaseCondaService = require('./conda-base')

module.exports = class CondaPlatform extends BaseCondaService {
  static category = 'platform-support'
  static route = { base: 'conda', pattern: ':variant(p|pn)/:channel/:pkg' }

  static examples = [
    {
      title: 'Conda',
      namedParams: { channel: 'conda-forge', package: 'python' },
      pattern: 'pn/:channel/:package',
      staticPreview: this.render({
        variant: 'pn',
        platforms: ['linux-64', 'win-32', 'osx-64', 'win-64'],
      }),
    },
  ]

  static render({ variant, platforms }) {
    return {
      label: variant === 'pn' ? 'platform' : 'conda|platform',
      message: platforms.join(' | '),
    }
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({ variant, platforms: json.conda_platforms })
  }
}
