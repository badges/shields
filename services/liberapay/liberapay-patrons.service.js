'use strict'

const { LiberapayBase } = require('./liberapay-base')
const { metric } = require('../../lib/text-formatters')
const { colorScale } = require('../../lib/color-formatters')

module.exports = class LiberapayPatrons extends LiberapayBase {
  static get route() {
    return this.buildRoute('patrons')
  }

  static get examples() {
    return [
      {
        title: 'Liberapay patrons',
        namedParams: { entity: 'Changaco' },
        staticPreview: this.render({ patrons: 10 }),
      },
    ]
  }

  static render({ patrons }) {
    return {
      label: 'patrons',
      message: metric(patrons),
      color: colorScale([0, 10, 100])(patrons),
    }
  }

  async handle({ entity }) {
    const data = await this.fetch({ entity })
    return this.constructor.render({ patrons: data.npatrons })
  }
}
