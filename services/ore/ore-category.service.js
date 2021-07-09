import { BaseOreService, documentation, keywords } from './ore-base.js'

export default class OreCategory extends BaseOreService {
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
    color: 'blue',
  }

  static render({ category }) {
    return {
      message: category,
    }
  }

  transform({ data }) {
    const category = data.category.replace(/_/g, ' ')
    return { category }
  }

  async handle({ pluginId }) {
    const data = await this.fetch({ pluginId })
    const { category } = this.transform({ data })
    return this.constructor.render({ category })
  }
}
