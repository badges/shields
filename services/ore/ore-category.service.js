'use strict'

const { BaseOreService, documentation, keywords } = require('./ore-base')

module.exports = class OreCategory extends BaseOreService {
  static category = 'other'

  static route = {
    base: 'ore/category',
    pattern: ':pluginId',
  }

  static examples = [
    {
      title: 'Ore Category',
      namedParams: {
        pluginId: 'nucleus',
      },
      staticPreview: this.render({ category: 'misc' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'category',
  }

  static render({ category }) {
    return {
      message: category.replace(/_/g, ' '),
      color: 'blue',
    }
  }

  async handle({ pluginId }) {
    const { category } = await this.fetch({ pluginId })
    return this.constructor.render({ category })
  }
}
