'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyLangs extends LocalazyBase {
  static route = this.buildRoute('langs')

  static examples = [
    {
      title: 'Localazy number of languages',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      staticPreview: this.render({
        message: '97 langs',
        label: 'translated',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'translated',
      content: 'langs',
    })
    return this.constructor.render({ message, label, color })
  }
}
