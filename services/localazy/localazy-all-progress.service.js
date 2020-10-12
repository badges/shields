'use strict'

const LocalazyBase = require('./localazy-base.service')

module.exports = class LocalazyAllProgress extends LocalazyBase {
  static route = this.buildRoute('')

  static examples = [
    {
      title: 'Localazy translation progress',
      keywords: this.keywords,
      documentation: this.documentation,
      namedParams: {
        projectId: 'floating-apps',
      },
      staticPreview: this.render({
        message: '61%',
        label: 'translated',
        color: '#066fef',
      }),
    },
  ]

  async handle({ projectId }) {
    const { message, label, color } = await this.fetch({
      projectId,
      title: 'translated',
      content: 'progress',
    })
    console.log(label, message, color)
    return this.constructor.render({ message, label, color })
  }
}
