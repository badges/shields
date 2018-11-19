'use strict'

const BaseCondaService = require('./conda-base')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class CondaDownloads extends BaseCondaService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'conda',
      pattern: ':which(v|vn)/:channel/:pkg',
    }
  }

  static get examples() {
    return [
      {
        title: 'Conda',
        namedParams: { channel: 'conda-forge', package: 'python' },
        pattern: 'v/:channel/:package',
        staticExample: this.render({
          which: 'v',
          channel: 'conda-forge',
          version: '3.7.1',
        }),
      },
      {
        title: 'Conda (channel only)',
        namedParams: { channel: 'conda-forge', package: 'python' },
        pattern: 'vn/:channel/:package',
        staticExample: this.render({
          which: 'vn',
          channel: 'conda-forge',
          version: '3.7.1',
        }),
      },
    ]
  }

  static render({ which, channel, version }) {
    return {
      label: which === 'vn' ? channel : `conda|${channel}`,
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ which, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({
      which,
      channel,
      version: json.latest_version,
    })
  }
}
