'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyAll extends LocalazyBase {
  static route = this.buildRoute('overall')

  static examples = [
    {
      title: 'Localazy translation progress with langs',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      staticPreview: this.render({
        message: '61%, 97 langs',
        label: 'translated',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'translated',
      content: 'all',
    })
    console.log(label, message, color)
    return this.constructor.render({ message, label, color })
  }
}
