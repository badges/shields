'use strict'

const BaseCondaService = require('./conda-base')
const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')

module.exports = class CondaDownloads extends BaseCondaService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'conda',
      pattern: ':which(d|dn)/:channel/:pkg',
    }
  }

  static get examples() {
    return [
      {
        title: 'Conda',
        namedParams: { channel: 'conda-forge', package: 'python' },
        pattern: 'dn/:channel/:package',
        staticExample: this.render({ which: 'dn', downloads: 5000000 }),
      },
    ]
  }

  static render({ which, downloads }) {
    return {
      label: which === 'dn' ? 'downloads' : 'conda|downloads',
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ which, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    const downloads = json.files.reduce(
      (total, file) => total + file.ndownloads,
      0
    )
    return this.constructor.render({ which, downloads })
  }
}
