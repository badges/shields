'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyLangsSimple extends LocalazyBase {
  static route = this.buildRoute('langs-simple')
  static examples = [
    {
      title: 'Localazy simple number of languages',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      staticPreview: this.render({
        message: '97',
        label: 'translated',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'translated',
      content: 'langs-count',
    })
    return this.constructor.render({ message, label, color })
  }
}
