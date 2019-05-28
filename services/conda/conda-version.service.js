'use strict'

const { addv: versionText } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const BaseCondaService = require('./conda-base')

module.exports = class CondaVersion extends BaseCondaService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'conda',
      pattern: ':variant(v|vn)/:channel/:pkg',
    }
  }

  static get examples() {
    return [
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
  }

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
