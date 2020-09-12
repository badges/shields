'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const BaseCondaService = require('./conda-base')

module.exports = class CondaDownloads extends BaseCondaService {
  static category = 'downloads'
  static route = { base: 'conda', pattern: ':variant(d|dn)/:channel/:pkg' }

  static examples = [
    {
      title: 'Conda',
      namedParams: { channel: 'conda-forge', package: 'python' },
      pattern: 'dn/:channel/:package',
      staticPreview: this.render({ variant: 'dn', downloads: 5000000 }),
    },
  ]

  static render({ variant, downloads }) {
    return {
      label: variant === 'dn' ? 'downloads' : 'conda|downloads',
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    const downloads = json.files.reduce(
      (total, file) => total + file.ndownloads,
      0
    )
    return this.constructor.render({ variant, downloads })
  }
}
